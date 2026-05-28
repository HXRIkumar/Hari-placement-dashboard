import { useState, useEffect } from 'react';
import { parseAllCSV } from '../lib/parser';
import { buildCompanyProfiles, computeAggregateStats, computePackageDistribution } from '../lib/engine';

export function useCSVData() {
  const [profiles, setProfiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [packageDist, setPackageDist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const allData = await parseAllCSV();
        if (cancelled) return;

        const companyProfiles = buildCompanyProfiles(allData);
        const aggregateStats = computeAggregateStats(companyProfiles);
        const distribution = computePackageDistribution(companyProfiles);

        setProfiles(companyProfiles);
        setStats(aggregateStats);
        setPackageDist(distribution);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load placement data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { profiles, stats, packageDist, isLoading, error };
}
