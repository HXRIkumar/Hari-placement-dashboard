/**
 * PIOS v2 — Analytics Engine
 * Aggregates historical placement data to build 2027 target strategy.
 * All computations are defensive with outlier clamping.
 */
import { HARI_PROFILE, DOMAIN_SKILL_MAP } from './constants';

/**
 * Minimum total applicants for a company to appear in selection-rate charts.
 * Companies with fewer applicants produce statistically unreliable ratios
 * (e.g., 2 applied / 2 selected = 100%) that distort the Y-axis.
 */
export const CONFIDENCE_THRESHOLD = 50;

/**
 * Aggregate all years of raw company data into unified company profiles.
 * Each company gets a single entry with historical stats.
 */
export function buildCompanyProfiles(allData) {
  const map = new Map();

  for (const [year, rows] of Object.entries(allData)) {
    for (const row of rows) {
      // Filter extreme CTC outliers
      if (row.CTC_LPA > 100) continue;

      const key = row.Company.toLowerCase().trim();
      if (!map.has(key)) {
        map.set(key, {
          name: row.Company,
          domain: row.Domain,
          category: row.Category,
          roles: new Set(),
          visits: [],
          cutoffs: [],
          cgpaCutoffs: [],
        });
      }
      const profile = map.get(key);
      profile.roles.add(row.Role);
      // Use latest domain/category if it changes
      profile.domain = row.Domain;
      profile.category = row.Category;

      const applied = Math.max(0, row.Students_Applied || 0);
      const selected = Math.max(0, row.Students_Placed || 0);
      // CLAMP: selection cannot exceed applications
      const clampedSelected = Math.min(selected, applied);
      const selectionRate = applied > 0 ? clampedSelected / applied : 0;

      profile.visits.push({
        year,
        role: row.Role,
        ctc: row.CTC_LPA,
        applied,
        selected: clampedSelected,
        selectionRate: Math.min(1, selectionRate),
        rawCategory: row.RawCategory || '',
      });

      if (row.Tenth_Cutoff > 0) {
        profile.cutoffs.push(row.Tenth_Cutoff);
      }
      if (row.CGPA_Cutoff > 0) {
        profile.cgpaCutoffs.push(row.CGPA_Cutoff);
      }
    }
  }

  // Convert Map to sorted array of enriched profiles
  const profiles = [];
  for (const [, raw] of map) {
    const visits = raw.visits;
    if (visits.length === 0) continue;

    const ctcs = visits.map((v) => v.ctc).filter((c) => c > 0);
    const avgCTC = ctcs.length > 0 ? ctcs.reduce((a, b) => a + b, 0) / ctcs.length : 0;
    const maxCTC = ctcs.length > 0 ? Math.max(...ctcs) : 0;
    const rates = visits.map((v) => v.selectionRate).filter((r) => r >= 0);
    const avgSelectionRate = rates.length > 0
      ? rates.reduce((a, b) => a + b, 0) / rates.length
      : 0;
    const totalApplied = visits.reduce((s, v) => s + v.applied, 0);
    const totalSelected = visits.reduce((s, v) => s + v.selected, 0);

    // Eligibility
    const typicalCutoff = raw.cutoffs.length > 0
      ? Math.max(...raw.cutoffs)
      : 0;
    const typicalCGPA = raw.cgpaCutoffs.length > 0
      ? Math.max(...raw.cgpaCutoffs)
      : 0;

    const eligibility = computeEligibility(typicalCutoff, typicalCGPA, HARI_PROFILE);

    // Prep difficulty (1-10)
    const difficulty = computeDifficulty(avgSelectionRate, avgCTC, raw.category);

    // Skill focus
    const skillFocus = DOMAIN_SKILL_MAP[raw.domain] || DOMAIN_SKILL_MAP['Other'];

    // Years visited (unique)
    const yearsVisited = [...new Set(visits.map((v) => v.year))].sort();

    profiles.push({
      id: raw.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: raw.name,
      domain: raw.domain,
      category: raw.category,
      roles: [...raw.roles],
      avgCTC: parseFloat(avgCTC.toFixed(2)),
      maxCTC: parseFloat(maxCTC.toFixed(2)),
      avgSelectionRate: parseFloat(Math.min(1, avgSelectionRate).toFixed(4)),
      totalApplied,
      totalSelected: Math.min(totalSelected, totalApplied),
      eligibility,
      cutoff: typicalCutoff,
      cgpaCutoff: typicalCGPA,
      difficulty,
      skillFocus,
      yearsVisited,
      visitCount: yearsVisited.length,
      visits,
    });
  }

  return profiles.sort((a, b) => b.avgCTC - a.avgCTC);
}

/**
 * Compute eligibility status for Hari's profile.
 */
function computeEligibility(cutoff, cgpaCutoff, profile) {
  const reasons = [];

  if (cutoff > 0 && profile.tenthPercent < cutoff) {
    reasons.push(`10th/12th: ${profile.tenthPercent}% < ${cutoff}% required`);
  }
  if (cgpaCutoff > 0 && profile.cgpa < cgpaCutoff) {
    reasons.push(`CGPA: ${profile.cgpa} < ${cgpaCutoff} required`);
  }

  if (reasons.length === 0) {
    return { status: 'safe', label: 'Safe Target', reasons: [] };
  }

  // Borderline: cutoff is exactly at or within 3% of Hari's scores
  if (cutoff > 0 && cutoff <= profile.tenthPercent + 3 && cutoff > profile.tenthPercent) {
    return { status: 'borderline', label: 'Borderline', reasons };
  }

  return { status: 'blocked', label: 'Blocked', reasons };
}

/**
 * Compute preparation difficulty on a 1-10 scale.
 * Lower selection rate + higher CTC + higher category = harder.
 */
function computeDifficulty(avgSelectionRate, avgCTC, category) {
  let score = 5; // base

  // Selection rate impact (lower = harder)
  if (avgSelectionRate < 0.005) score += 3;
  else if (avgSelectionRate < 0.01) score += 2;
  else if (avgSelectionRate < 0.03) score += 1;
  else if (avgSelectionRate > 0.1) score -= 2;
  else if (avgSelectionRate > 0.05) score -= 1;

  // CTC impact
  if (avgCTC > 25) score += 2;
  else if (avgCTC > 15) score += 1;
  else if (avgCTC < 5) score -= 1;

  // Category impact
  if (category === 'Super Dream') score += 1;
  else if (category === 'Mass') score -= 1;

  return Math.max(1, Math.min(10, Math.round(score)));
}

/**
 * Compute aggregate statistics from company profiles.
 */
export function computeAggregateStats(profiles) {
  const safe = profiles.filter((p) => p.eligibility.status === 'safe');
  const blocked = profiles.filter((p) => p.eligibility.status === 'blocked');
  const borderline = profiles.filter((p) => p.eligibility.status === 'borderline');

  const safeCTCs = safe.map((p) => p.avgCTC).filter((c) => c > 0);
  const allCTCs = profiles.map((p) => p.avgCTC).filter((c) => c > 0);

  return {
    totalCompanies: profiles.length,
    safeCount: safe.length,
    blockedCount: blocked.length,
    borderlineCount: borderline.length,
    accessRate: profiles.length > 0
      ? parseFloat(((safe.length / profiles.length) * 100).toFixed(1))
      : 0,
    avgSafeCTC: safeCTCs.length > 0
      ? parseFloat((safeCTCs.reduce((a, b) => a + b, 0) / safeCTCs.length).toFixed(2))
      : 0,
    maxSafeCTC: safeCTCs.length > 0 ? parseFloat(Math.max(...safeCTCs).toFixed(2)) : 0,
    medianCTC: computeMedian(allCTCs),
    avgSelectionRate: profiles.length > 0
      ? parseFloat(
          (profiles.reduce((s, p) => s + p.avgSelectionRate, 0) / profiles.length * 100).toFixed(2)
        )
      : 0,
  };
}

/**
 * Compute package distribution buckets for bar chart.
 * Returns counts in: 0-5L, 5-10L, 10-15L, 15-20L, 20-30L, 30L+
 */
export function computePackageDistribution(profiles) {
  const buckets = [
    { range: '0-5L', min: 0, max: 5, count: 0, safeCount: 0, borderlineCount: 0 },
    { range: '5-10L', min: 5, max: 10, count: 0, safeCount: 0, borderlineCount: 0 },
    { range: '10-15L', min: 10, max: 15, count: 0, safeCount: 0, borderlineCount: 0 },
    { range: '15-20L', min: 15, max: 20, count: 0, safeCount: 0, borderlineCount: 0 },
    { range: '20-30L', min: 20, max: 30, count: 0, safeCount: 0, borderlineCount: 0 },
    { range: '30L+', min: 30, max: Infinity, count: 0, safeCount: 0, borderlineCount: 0 },
  ];

  // Only count safe + borderline companies. Blocked companies are excluded
  // from aggregate CTC charts to reduce FOMO and visual clutter.
  for (const p of profiles) {
    if (p.eligibility.status === 'blocked') continue;
    const bucket = buckets.find((b) => p.avgCTC >= b.min && p.avgCTC < b.max);
    if (bucket) {
      bucket.count++;
      if (p.eligibility.status === 'safe') bucket.safeCount++;
      else bucket.borderlineCount++;
    }
  }

  return buckets;
}

function computeMedian(arr) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? parseFloat(sorted[mid].toFixed(2))
    : parseFloat(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
}
