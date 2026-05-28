/**
 * PIOS — CSV Data Parser (v2: Real-World Schema)
 *
 * Handles the messy, real-world SRM IST placement CSV format:
 *   company_name, visit_date, role, category, ctc,
 *   eligibility_10_12_ug, students_applied, students_selected
 *
 * Normalizes every row into the clean interface the engine and UI expect:
 *   Company, Role, CTC_LPA, Students_Applied, Students_Placed,
 *   Tenth_Cutoff, Twelfth_Cutoff, CGPA_Cutoff, Category, Domain, etc.
 */
import Papa from 'papaparse';
import { CSV_YEARS, LEVEL_TO_CATEGORY } from './constants';

// ────────────────────────────────────────────────────────────────
//  CTC Normalization  (the hardest part — real data is *wild*)
// ────────────────────────────────────────────────────────────────

/**
 * Convert a messy CTC string into a clean float in LPA.
 *
 * Handles:
 *   "75000 per month"          → 75000 * 12 / 100000 = 9.0
 *   "14 - 16 lpa"              → avg(14, 16) = 15.0
 *   "10 lpa"                   → 10.0
 *   "11LPA"                    → 11.0
 *   "4,20,000.00 per Annum"    → 4.2
 *   "6,00,000.00 per Annum"    → 6.0
 *   "450000 - 700000 per year" → avg(4.5, 7.0) = 5.75
 *   "575000 - 750000 per year" → avg(5.75, 7.5) = 6.625
 *   "30K per month" / "75k"    → 30000 per month → 3.6
 *   "stipend: 50000; CTC: 14-16LPA" → parse the CTC part → 15.0
 *   "B.Tech - 34.21 LPA"      → 34.21
 *   "INR 1684500"              → 16.845
 *   "NIL" / "-" / empty        → 0
 *
 * @param {string} raw — the messy ctc field
 * @returns {number} CTC in LPA (lakhs per annum)
 */
export function normalizeCTC(raw, context = {}) {
  if (!raw || typeof raw !== 'string') return 0;

  const isInternship = /intern|trainee|apprentice/i.test(context.role || '') ||
    /intern/i.test(context.category || '');

  let s = raw.trim();
  if (!s || s === '-' || s.toUpperCase() === 'NIL' || s.toUpperCase() === 'NA') return 0;

  // If the string contains a "CTC:" portion (e.g., "STIPEND: 50K; CTC: 14-16 LPA"), isolate it
  const ctcSplit = s.match(/CTC\s*[:=]\s*(.+)/i);
  if (ctcSplit) {
    s = ctcSplit[1].trim();
  }

  // Remove noise tokens
  s = s.replace(/(?:refer\s+jd.*)/i, '');
  // If nothing useful remains
  if (!s || s === '-') return 0;

  // ── Guard: Reject pure percentage strings (e.g., "85%" leaked from eligibility column) ──
  if (/^\d{1,3}\s*%$/.test(s)) return 0;

  // ── Guard: Reject "Stipend: X" without any CTC/LPA context ──
  if (/^stipend\s*:/i.test(s) && !/ctc|lpa|per\s*(year|annum)/i.test(s)) {
    // It's just a stipend with no FTE CTC — try to parse stipend as monthly
    const stipendMatch = s.match(/(\d[\d,]*)\s*(?:k|per\s*month|p\.?m\.?)?/i);
    if (stipendMatch) {
      let monthly = parseFloat(stipendMatch[1].replace(/,/g, ''));
      if (/k/i.test(s) && monthly < 10000) monthly *= 1000;
      if (monthly > 0) return parseFloat(((monthly * 12) / 100000).toFixed(2));
    }
    return 0;
  }

  const lower = s.toLowerCase();

  // ── Per-month detection (stipend/internship) ──
  const isPerMonth = /per\s*month|p\.?m\.?|kpm/i.test(lower);
  if (isPerMonth) {
    // Extract all numbers from the per-month string
    const nums = extractNumbers(s);
    if (nums.length === 0) return 0;
    // Take the largest number as the monthly figure
    let monthly = Math.max(...nums);
    // Handle "K" shorthand: "30K per month" → nums might give 30
    if (monthly < 1000 && /\d+\s*k/i.test(s)) {
      monthly = monthly * 1000;
    }
    return parseFloat(((monthly * 12) / 100000).toFixed(2));
  }

  // ── Per-year / per-annum detection (raw annual figures) ──
  const isPerYear = /per\s*(?:year|annum)/i.test(lower);
  if (isPerYear) {
    // Clean Indian comma formatting "4,20,000.00" → "420000"
    const cleaned = s.replace(/,/g, '');
    const nums = extractNumbers(cleaned);
    if (nums.length === 0) return 0;
    if (nums.length >= 2) {
      // Range like "450000 - 700000 per year"
      const low = Math.min(...nums);
      const high = Math.max(...nums);
      // Both should be annual figures
      const avgAnnual = (low + high) / 2;
      return parseFloat((avgAnnual / 100000).toFixed(2));
    }
    return parseFloat((nums[0] / 100000).toFixed(2));
  }

  // ── LPA format detection ──
  const isLPA = /lpa|l\.?p\.?a|lacs?\b|lakhs?\b/i.test(lower);
  if (isLPA) {
    const nums = extractNumbers(s);
    if (nums.length === 0) return 0;

    // Sanity-normalize: if a number > 200, it's annual rupees mislabeled as "LPA"
    const normalized = nums.map((n) => (n > 200 ? parseFloat((n / 100000).toFixed(2)) : n));

    if (normalized.length >= 2) {
      const plausible = normalized.filter((n) => n > 0 && n < 200);
      if (plausible.length >= 2) {
        return parseFloat(((plausible[0] + plausible[1]) / 2).toFixed(2));
      }
      return plausible[0] || normalized[0];
    }
    return normalized[0];
  }

  // ── INR raw number ──
  if (/INR/i.test(s)) {
    const cleaned = s.replace(/,/g, '');
    const nums = extractNumbers(cleaned);
    if (nums.length > 0) {
      const val = Math.max(...nums);
      // If value > 100000, it's annual in rupees
      if (val > 100000) return parseFloat((val / 100000).toFixed(2));
      return val;
    }
  }

  // ── Pure number fallback ──
  const cleaned = s.replace(/,/g, '');
  const nums = extractNumbers(cleaned);
  if (nums.length === 0) return 0;

  if (nums.length >= 2) {
    // Range without "LPA" label
    const plausible = nums.filter((n) => n > 0);
    if (plausible.length >= 2) {
      const low = plausible[0];
      const high = plausible[1];
      // If both > 100000, they're annual rupees
      if (low > 100000 && high > 100000) {
        return parseFloat((((low + high) / 2) / 100000).toFixed(2));
      }
      // If both < 200, they're already LPA
      if (low < 200 && high < 200) {
        return parseFloat(((low + high) / 2).toFixed(2));
      }
    }
  }

  const val = nums[0];
  // Heuristic for bare numbers:
  if (val > 100000) {
    // e.g., 1200000, 600000 — annual rupees
    return parseFloat((val / 100000).toFixed(2));
  }
  if (val < 200) {
    // e.g., 5, 10, 15 — already in LPA
    return val;
  }
  // val is 200-100000 — ambiguous zone
  if (isInternship && val >= 5000 && val <= 200000) {
    // Internship/trainee: treat bare numbers (e.g., 75000, 25000) as monthly stipend
    return parseFloat(((val * 12) / 100000).toFixed(2));
  }
  // Non-internship: treat as annual rupees
  if (val >= 1000) return parseFloat((val / 100000).toFixed(2));

  return val;
}

/**
 * Extract all numeric values from a string.
 * Handles decimals, Indian formatting, and K-suffix.
 */
function extractNumbers(s) {
  const results = [];
  // Match numbers with optional decimals, handling Indian comma format
  const regex = /(\d[\d,]*\.?\d*)\s*k?\b/gi;
  let match;
  while ((match = regex.exec(s)) !== null) {
    let numStr = match[1].replace(/,/g, '');
    let val = parseFloat(numStr);
    if (isNaN(val)) continue;
    // Check for K suffix right after the number
    const afterNum = s.substring(match.index + match[0].length - 1, match.index + match[0].length + 1);
    if (/k/i.test(match[0]) && val < 10000) {
      val = val * 1000;
    }
    if (val > 0) results.push(val);
  }
  return results;
}


// ────────────────────────────────────────────────────────────────
//  Eligibility Normalization
// ────────────────────────────────────────────────────────────────

/**
 * Parse the messy "eligibility_10_12_ug" field into a numeric cutoff percentage.
 *
 * Examples:
 *   "60%"                     → 60
 *   "75%"                     → 75
 *   "60%(UG-70%)"             → 60  (we take the 10th/12th cutoff, not UG)
 *   "80%(UG-75%)"             → 80
 *   "85%"                     → 85
 *   "60% (UG - 90%)"         → 60
 *   "All students..."         → 0  (no cutoff)
 *   "Not Mentioned" / "-"     → 0
 *   "NA"                      → 0
 *   "6 CGPA OR 60 %"         → 60
 *   "7 CGPA OR 70 %"         → 70
 *   "8.5 CGPA OR 85 %"       → 85
 *   "70"                      → 70  (no % sign but numeric)
 *   "60"                      → 60
 *
 * Also extracts UG CGPA cutoff if present (e.g., "8 CGPA", "7.5 CGPA")
 *
 * @param {string} raw
 * @returns {{ tenthTwelfthCutoff: number, cgpaCutoff: number }}
 */
export function parseEligibility(raw) {
  if (!raw || typeof raw !== 'string') return { tenthTwelfthCutoff: 0, cgpaCutoff: 0 };

  const s = raw.trim();
  if (!s || s === '-' || s.toUpperCase() === 'NA' || s.toUpperCase() === 'NOT MENTIONED') {
    return { tenthTwelfthCutoff: 0, cgpaCutoff: 0 };
  }

  // "All students" / "All B.Tech" → no cutoff
  if (/all\s+(students|b\.?tech)/i.test(s)) {
    return { tenthTwelfthCutoff: 0, cgpaCutoff: 0 };
  }

  let tenthTwelfthCutoff = 0;
  let cgpaCutoff = 0;

  // Extract CGPA cutoff: "8 CGPA", "7.5 CGPA", "9 CGPA in UG"
  const cgpaMatch = s.match(/([\d.]+)\s*CGPA/i);
  if (cgpaMatch) {
    cgpaCutoff = parseFloat(cgpaMatch[1]) || 0;
  }

  // Try to extract the primary 10th/12th percentage
  // Pattern: starts with a number optionally followed by %
  // e.g., "60%", "75%(UG-70%)", "60 %", "70"
  const percentMatch = s.match(/^(\d{2,3})\s*%?/);
  if (percentMatch) {
    tenthTwelfthCutoff = parseFloat(percentMatch[1]) || 0;
  }

  // If no leading percent found, look for "X %" pattern
  if (tenthTwelfthCutoff === 0) {
    const altMatch = s.match(/(\d{2,3})\s*%/);
    if (altMatch) {
      tenthTwelfthCutoff = parseFloat(altMatch[1]) || 0;
    }
  }

  // If still 0 and we have a CGPA, try to derive from CGPA
  // "6 CGPA OR 60 %" → we should have caught the 60% above
  // "7 CGPA OR 70 %" → same
  if (tenthTwelfthCutoff === 0 && cgpaCutoff > 0) {
    // Some entries are just "6 CGPA OR 60 %" — search for the percent part
    const orMatch = s.match(/OR\s*(\d{2,3})\s*%/i);
    if (orMatch) {
      tenthTwelfthCutoff = parseFloat(orMatch[1]) || 0;
    }
  }

  // Pure numeric fallback: "60", "70", "80"
  if (tenthTwelfthCutoff === 0 && cgpaCutoff === 0) {
    const num = parseFloat(s);
    if (!isNaN(num) && num >= 40 && num <= 100) {
      tenthTwelfthCutoff = num;
    }
  }

  // Sanity: if cutoff is something weird like 6 (meant as CGPA, not %), fix it
  if (tenthTwelfthCutoff > 0 && tenthTwelfthCutoff < 40) {
    // This is probably a CGPA, not a percentage
    if (cgpaCutoff === 0) cgpaCutoff = tenthTwelfthCutoff;
    tenthTwelfthCutoff = 0;
  }

  return { tenthTwelfthCutoff, cgpaCutoff };
}


// ────────────────────────────────────────────────────────────────
//  Category Normalization
// ────────────────────────────────────────────────────────────────

/**
 * Convert SRM's "Level N - Label (Placement/ILP)" to our tiered categories.
 *   "Level 2 - Marquee (Placement)"     → "Super Premium"
 *   "Level 3 - Super Dream (ILP)"       → "Premium"
 *   "Level 4 - Dream (Placement)"       → "Mid"
 *   "Level 5 - Day 1/ Day2 (Placement)" → "Mass"
 *   "Level 6 - IT / Non- Engineering"   → "Mass"
 *   "Level 7 - Regular Internship"      → "Mid"
 *
 * @param {string} raw
 * @returns {string}
 */
function normalizeCategory(raw) {
  if (!raw || typeof raw !== 'string') return 'Other';
  const s = raw.trim();

  // Extract the Level number
  const levelMatch = s.match(/Level\s*(\d)/i);
  if (levelMatch) {
    const levelKey = `Level ${levelMatch[1]}`;
    return LEVEL_TO_CATEGORY[levelKey] || 'Other';
  }
  return 'Other';
}


// ────────────────────────────────────────────────────────────────
//  Domain Inference (not present in real CSV — inferred from company/role)
// ────────────────────────────────────────────────────────────────

/** Known company→domain mappings for common SRM recruiters */
const COMPANY_DOMAIN_MAP = {
  tcs: 'IT Services', infosys: 'IT Services', wipro: 'IT Services', cognizant: 'IT Services',
  'tech mahindra': 'IT Services', hcl: 'IT Services', accenture: 'IT Services', capgemini: 'IT Services',
  mphasis: 'IT Services', mindtree: 'IT Services', lti: 'IT Services', hexaware: 'IT Services',
  'l&t technology': 'IT Services', virtusa: 'IT Services', ltimindtree: 'IT Services',
  'kpit': 'IT Services', ust: 'IT Services', epam: 'IT Services',

  amazon: 'Product', google: 'Product', microsoft: 'Product', flipkart: 'Product',
  adobe: 'Product', oracle: 'Product', servicenow: 'Product', atlassian: 'Product',
  uber: 'Product', samsung: 'Product', dell: 'Product', hp: 'Product', hpe: 'Product',
  zoho: 'Product', freshworks: 'Product', salesforce: 'Product', poshmark: 'Product',
  booking: 'Product', sprinklr: 'Product', commvault: 'Product', browserstack: 'Product',
  intuit: 'Product', xperi: 'Product', nutanix: 'Product', databricks: 'Product',
  twilio: 'Product', uipath: 'Product', akamai: 'Product',

  'jp morgan': 'Finance', 'goldman sachs': 'Finance', 'morgan stanley': 'Finance',
  barclays: 'Finance', 'wells fargo': 'Finance', 'wellsfargo': 'Finance', hsbc: 'Finance',
  'bnp paribas': 'Finance', 'bny mellon': 'Finance', 'bank of america': 'Finance',
  'standard chartered': 'Finance', 'state street': 'Finance', citi: 'Finance',
  'fidelity': 'Finance', 'idfc': 'Finance', 'federal bank': 'Finance',
  'icici': 'Finance', bajaj: 'Finance',

  paypal: 'FinTech', razorpay: 'FinTech', phonepe: 'FinTech', cred: 'FinTech',
  paytm: 'FinTech', pine: 'FinTech', juspay: 'FinTech', zeta: 'FinTech',

  deloitte: 'Consulting', kpmg: 'Consulting', ey: 'Consulting', pwc: 'Consulting',

  'tiger analytics': 'Analytics', 'zs associates': 'Analytics', 'mu sigma': 'Analytics',
  'latentview': 'Analytics', fractal: 'Analytics', tredence: 'Analytics', mathco: 'Analytics',
  merilytics: 'Analytics', pharmaace: 'Analytics',

  sap: 'Enterprise', siemens: 'Enterprise', schneider: 'Enterprise', honeywell: 'Enterprise',
  bosch: 'Enterprise', nokia: 'Enterprise', qualcomm: 'Semiconductor', intel: 'Semiconductor',
  infineon: 'Semiconductor', microchip: 'Semiconductor', micron: 'Semiconductor',

  'tata motors': 'Automotive', 'maruti': 'Automotive', 'mahindra': 'Automotive',
  'royal enfield': 'Automotive', 'hero': 'Automotive', hyundai: 'Automotive',
  john: 'Automotive', ford: 'Automotive', stellantis: 'Automotive', volvo: 'Automotive',
  caterpillar: 'Automotive', aptiv: 'Automotive', valeo: 'Automotive',

  roche: 'Healthcare', philips: 'Healthcare', medtronic: 'Healthcare',
  novartis: 'Healthcare', 'johnson & johnson': 'Healthcare', stryker: 'Healthcare',

  'hindustan unilever': 'FMCG', itc: 'FMCG', 'asian paints': 'FMCG',
  'godrej': 'FMCG', 'coca-cola': 'FMCG', diageo: 'FMCG',

  reliance: 'Enterprise', 'jio': 'Telecom', airtel: 'Telecom',

  cisco: 'Networking',
};

/**
 * Infer domain from company name using fuzzy matching.
 */
function inferDomain(companyName) {
  if (!companyName) return 'Other';
  const lower = companyName.toLowerCase();

  for (const [pattern, domain] of Object.entries(COMPANY_DOMAIN_MAP)) {
    if (lower.includes(pattern)) return domain;
  }

  // Fallback heuristics based on role keywords could be added,
  // but company matching covers 80%+ of real data.
  return 'Other';
}


// ────────────────────────────────────────────────────────────────
//  Row Normalization (new schema → old interface)
// ────────────────────────────────────────────────────────────────

/**
 * Normalize a single real-world CSV row into the interface
 * that engine.js and all UI components expect.
 */
function normalizeRow(row) {
  const companyName = (row.company_name || row.Company || '').trim();
  const role = (row.role || row.Role || '').trim();
  const rawCTC = row.ctc || row.CTC_LPA || '';
  const rawEligibility = row.eligibility_10_12_ug || '';
  const rawCategory = row.category || row.Category || '';
  const rawApplied = row.students_applied || row.Students_Applied || '0';
  const rawSelected = row.students_selected || row.Students_Placed || '0';
  const visitDate = (row.visit_date || '').trim();

  const ctcLPA = normalizeCTC(String(rawCTC), { role, category: rawCategory });
  const { tenthTwelfthCutoff, cgpaCutoff } = parseEligibility(String(rawEligibility));
  const category = normalizeCategory(String(rawCategory));
  const domain = inferDomain(companyName);

  return {
    Company: companyName,
    Role: role,
    CTC_LPA: ctcLPA,
    Base_LPA: ctcLPA, // Real data has no separate base; use CTC
    Students_Eligible: 0, // Not in real data
    Students_Applied: parseInt(String(rawApplied).replace(/,/g, ''), 10) || 0,
    Students_Shortlisted: 0, // Not in real data
    Students_Placed: parseInt(String(rawSelected).replace(/,/g, ''), 10) || 0,
    Selection_Process: '', // Not in real data; leave empty
    CGPA_Cutoff: cgpaCutoff,
    Tenth_Cutoff: tenthTwelfthCutoff,
    Twelfth_Cutoff: tenthTwelfthCutoff, // Same column covers both
    Backlog_Allowed: 'No', // Assume no backlogs (SRM default)
    Category: category,
    Domain: domain,
    VisitDate: visitDate, // Extra field from real data
    RawCategory: String(rawCategory).trim(), // Keep original for reference
  };
}


// ────────────────────────────────────────────────────────────────
//  CSV Fetching & Parsing
// ────────────────────────────────────────────────────────────────

/**
 * Fetch and parse a single CSV file by year.
 * @param {string} year
 * @returns {Promise<Array>}
 */
async function fetchCSV(year) {
  const url = `/placement-data/${year}.csv`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`PIOS Parser: Failed to fetch ${url} — status ${response.status}`);
      return [];
    }
    const text = await response.text();
    if (!text.trim()) {
      console.warn(`PIOS Parser: Empty CSV for ${year}`);
      return [];
    }
    return new Promise((resolve) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const normalized = results.data
            .map(normalizeRow)
            .filter((row) => row.Company.length > 0 && row.CTC_LPA > 0)
            .map((row) => ({ ...row, Year: year }));
          resolve(normalized);
        },
        error: () => {
          console.warn(`PIOS Parser: Parse error for ${year}`);
          resolve([]);
        },
      });
    });
  } catch (err) {
    console.warn(`PIOS Parser: Network error fetching ${year}`, err);
    return [];
  }
}

/**
 * Fetch and parse all CSV years in parallel.
 * @returns {Promise<Object>} { "2024": [...], "2025": [...], ... }
 */
export async function parseAllCSV() {
  const entries = await Promise.all(
    CSV_YEARS.map(async (year) => {
      const data = await fetchCSV(year);
      return [year, data];
    })
  );
  return Object.fromEntries(entries);
}
