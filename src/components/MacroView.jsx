import { useState, useMemo } from 'react';
import { useCompany } from '../context/CompanyContext';
import { HARI_PROFILE } from '../lib/constants';
import EligibilityWall from './EligibilityWall';
import PackageDistribution from './PackageDistribution';
import SelectionRatioChart from './SelectionRatioChart';
import PrepTimeline from './PrepTimeline';
import { Building2, ShieldCheck, ShieldX, TrendingUp, Search, ChevronRight, Zap } from 'lucide-react';

export default function MacroView({ profiles, stats, packageDist, highROISkills }) {
  const { selectCompany } = useCompany();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('ctc');

  const filtered = useMemo(() => {
    let result = profiles;

    if (filter !== 'all') {
      result = result.filter((p) => p.eligibility.status === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.domain.toLowerCase().includes(q) ||
          p.roles.some((r) => r.toLowerCase().includes(q))
      );
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'ctc': return b.avgCTC - a.avgCTC;
        case 'difficulty': return a.difficulty - b.difficulty;
        case 'selection': return b.avgSelectionRate - a.avgSelectionRate;
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

    return result;
  }, [profiles, filter, search, sortBy]);

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900">2027 Placement Strategy</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Aggregated intelligence from {stats?.totalCompanies || 0} companies across 4 years of SRM placement data.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Building2 className="w-4 h-4" />}
          label="Total Companies"
          value={stats?.totalCompanies || 0}
          sub="Across all years"
        />
        <StatCard
          icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
          label="Safe Targets"
          value={stats?.safeCount || 0}
          sub={`${stats?.accessRate || 0}% accessible`}
          accent="emerald"
        />
        <StatCard
          icon={<ShieldX className="w-4 h-4 text-rose-500" />}
          label="Blocked"
          value={stats?.blockedCount || 0}
          sub="By 67% cutoff"
          accent="rose"
        />
        <StatCard
          icon={<TrendingUp className="w-4 h-4 text-blue-500" />}
          label="Avg Safe CTC"
          value={`₹${stats?.avgSafeCTC || 0}L`}
          sub={`Max: ₹${stats?.maxSafeCTC || 0}L`}
          accent="blue"
        />
      </div>

      {/* Eligibility Wall */}
      <EligibilityWall profiles={profiles} stats={stats} />

      {/* Top High-ROI Focus Skills */}
      {highROISkills && highROISkills.length > 0 && (
        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-base font-semibold text-zinc-900">Top High-ROI Focus Skills</h3>
              <p className="text-xs text-zinc-500">Highest success rate domains for accessible companies</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {highROISkills.map((skill, i) => (
              <div key={skill.id} className="bg-zinc-50 rounded-lg p-4 border border-zinc-100">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Rank #{i + 1}</p>
                <p className="text-sm font-medium text-zinc-900 mb-3">{skill.name}</p>
                <div className="w-full bg-zinc-200 rounded-full h-1.5 mb-1.5">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${skill.normalized}%` }}></div>
                </div>
                <p className="text-[10px] text-zinc-400">Relative ROI Score: {skill.normalized}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PackageDistribution data={packageDist} />
        <SelectionRatioChart profiles={profiles} />
      </div>

      {/* Company Masterlist */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="p-5 border-b border-zinc-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-900">Target Masterlist</h3>
              <p className="text-xs text-zinc-400 mt-0.5">{filtered.length} companies · Click any row for deep analysis</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search companies, roles, domains..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-300 placeholder:text-zinc-400"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1">
              {['all', 'safe', 'blocked', 'borderline'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    filter === f
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none"
            >
              <option value="ctc">Sort: CTC ↓</option>
              <option value="difficulty">Sort: Easiest first</option>
              <option value="selection">Sort: Best odds</option>
              <option value="name">Sort: A-Z</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-50">
                <th className="text-left text-[11px] font-medium text-zinc-400 uppercase tracking-wider px-5 py-3">Company</th>
                <th className="text-left text-[11px] font-medium text-zinc-400 uppercase tracking-wider px-5 py-3">Domain</th>
                <th className="text-right text-[11px] font-medium text-zinc-400 uppercase tracking-wider px-5 py-3">Avg CTC</th>
                <th className="text-center text-[11px] font-medium text-zinc-400 uppercase tracking-wider px-5 py-3">Difficulty</th>
                <th className="text-right text-[11px] font-medium text-zinc-400 uppercase tracking-wider px-5 py-3">Selection %</th>
                <th className="text-center text-[11px] font-medium text-zinc-400 uppercase tracking-wider px-5 py-3">Eligibility</th>
                <th className="text-center text-[11px] font-medium text-zinc-400 uppercase tracking-wider px-5 py-3">Years</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.slice(0, 100).map((company) => (
                <tr
                  key={company.id}
                  onClick={() => selectCompany(company)}
                  className="hover:bg-zinc-50 cursor-pointer transition-colors group"
                >
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-zinc-900 group-hover:text-zinc-700">{company.name}</p>
                    <p className="text-[11px] text-zinc-400 truncate max-w-[250px]">{company.roles[0]}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">{company.domain}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-sm font-medium text-zinc-900">₹{company.avgCTC}L</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <DifficultyDots level={company.difficulty} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-sm text-zinc-700">{(company.avgSelectionRate * 100).toFixed(1)}%</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <EligibilityBadge status={company.eligibility.status} label={company.eligibility.label} />
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-xs text-zinc-400">{company.visitCount}yr</span>
                  </td>
                  <td className="px-3 py-3">
                    <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length > 100 && (
          <div className="text-center py-3 text-xs text-zinc-400 border-t border-zinc-100">
            Showing first 100 of {filtered.length} results. Use search to narrow down.
          </div>
        )}
      </div>

      {/* Prep Timeline */}
      <PrepTimeline />
    </div>
  );
}

// Sub-components

function StatCard({ icon, label, value, sub, accent }) {
  const bgColor = accent === 'emerald' ? 'bg-emerald-50' : accent === 'rose' ? 'bg-rose-50' : accent === 'blue' ? 'bg-blue-50' : 'bg-zinc-50';
  const iconBg = accent === 'emerald' ? 'bg-emerald-100' : accent === 'rose' ? 'bg-rose-100' : accent === 'blue' ? 'bg-blue-100' : 'bg-zinc-100';

  return (
    <div className={`${bgColor} rounded-xl p-5 border border-zinc-100`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-7 h-7 ${iconBg} rounded-lg flex items-center justify-center`}>{icon}</div>
        <span className="text-xs font-medium text-zinc-500">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-zinc-900">{value}</p>
      <p className="text-[11px] text-zinc-400 mt-1">{sub}</p>
    </div>
  );
}

function DifficultyDots({ level }) {
  return (
    <div className="flex items-center justify-center gap-0.5">
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i < level
              ? level <= 3 ? 'bg-emerald-400' : level <= 6 ? 'bg-amber-400' : 'bg-rose-400'
              : 'bg-zinc-200'
          }`}
        />
      ))}
    </div>
  );
}

function EligibilityBadge({ status, label }) {
  const styles = {
    safe: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blocked: 'bg-rose-50 text-rose-700 border-rose-200',
    borderline: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${styles[status] || styles.safe}`}>
      {label}
    </span>
  );
}
