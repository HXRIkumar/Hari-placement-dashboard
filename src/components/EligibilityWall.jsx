"use client";

import { useMemo } from 'react';
import { HARI_PROFILE } from '../lib/constants';
import { ShieldCheck, ShieldX, AlertTriangle } from 'lucide-react';

export default function EligibilityWall({ profiles, stats }) {
  const { safe, blocked, borderline } = useMemo(() => {
    return {
      safe: profiles.filter((p) => p.eligibility.status === 'safe'),
      blocked: profiles.filter((p) => p.eligibility.status === 'blocked'),
      borderline: profiles.filter((p) => p.eligibility.status === 'borderline'),
    };
  }, [profiles]);

  const total = profiles.length;
  const safeWidth = total > 0 ? (safe.length / total) * 100 : 0;
  const borderlineWidth = total > 0 ? (borderline.length / total) * 100 : 0;
  const blockedWidth = total > 0 ? (blocked.length / total) * 100 : 0;

  const topBlocked = [...blocked]
    .sort((a, b) => b.avgCTC - a.avgCTC)
    .slice(0, 6);

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-zinc-900">The 67% Eligibility Wall</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Your 10th/12th score of {HARI_PROFILE.tenthPercent}% determines access to {total} companies</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-zinc-900">{stats?.accessRate || 0}%</p>
          <p className="text-[11px] text-zinc-400">Accessible</p>
        </div>
      </div>

      {/* Stacked bar */}
      <div className="h-8 flex rounded-lg overflow-hidden mb-4">
        {safeWidth > 0 && (
          <div
            className="bg-emerald-400 flex items-center justify-center transition-all duration-500"
            style={{ width: `${safeWidth}%` }}
          >
            <span className="text-[11px] font-semibold text-white">{safe.length} Safe</span>
          </div>
        )}
        {borderlineWidth > 0 && (
          <div
            className="bg-amber-400 flex items-center justify-center transition-all duration-500"
            style={{ width: `${Math.max(borderlineWidth, 3)}%` }}
          >
            <span className="text-[11px] font-semibold text-white">{borderline.length}</span>
          </div>
        )}
        {blockedWidth > 0 && (
          <div
            className="bg-rose-400 flex items-center justify-center transition-all duration-500"
            style={{ width: `${blockedWidth}%` }}
          >
            <span className="text-[11px] font-semibold text-white">{blocked.length} Blocked</span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-5">
        <LegendItem icon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />} label="Safe Target" count={safe.length} description="No cutoff restriction" />
        <LegendItem icon={<AlertTriangle className="w-3.5 h-3.5 text-amber-500" />} label="Borderline" count={borderline.length} description="Within 3% of cutoff" />
        <LegendItem icon={<ShieldX className="w-3.5 h-3.5 text-rose-500" />} label="Blocked" count={blocked.length} description="Requires >67%" />
      </div>

      {/* Top blocked companies */}
      {topBlocked.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Highest value blocked companies</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {topBlocked.map((c) => (
              <div key={c.id} className="flex items-center justify-between bg-rose-50/50 rounded-lg px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-zinc-800">{c.name}</p>
                  <p className="text-[11px] text-zinc-400">Requires {c.cutoff}%</p>
                </div>
                <span className="text-sm font-semibold text-rose-600">₹{c.avgCTC}L</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LegendItem({ icon, label, count, description }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <span className="text-xs font-medium text-zinc-700">{label} ({count})</span>
        <p className="text-[10px] text-zinc-400">{description}</p>
      </div>
    </div>
  );
}
