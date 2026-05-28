"use client";

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CONFIDENCE_THRESHOLD } from '../lib/engine';

export default function SelectionRatioChart({ profiles }) {
  const data = useMemo(() => {
    return profiles
      .filter((p) => p.eligibility.status === 'safe' && p.avgSelectionRate > 0 && p.totalApplied > CONFIDENCE_THRESHOLD)
      .sort((a, b) => b.avgSelectionRate - a.avgSelectionRate)
      .slice(0, 15)
      .map((p) => ({
        name: p.name.length > 18 ? p.name.substring(0, 18) + '…' : p.name,
        fullName: p.name,
        rate: parseFloat(Math.min(100, p.avgSelectionRate * 100).toFixed(1)),
        ctc: p.avgCTC,
      }));
  }, [profiles]);

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-6">
      <h3 className="text-base font-semibold text-zinc-900 mb-1">Best Odds — Safe Targets</h3>
      <p className="text-xs text-zinc-400 mb-6">Top 15 accessible companies by selection rate</p>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barSize={14}>
            <XAxis
              type="number"
              domain={[0, (max) => Math.min(100, Math.ceil(max / 10) * 10)]}
              tick={{ fontSize: 11, fill: '#a1a1aa' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fontSize: 11, fill: '#71717a' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<RatioTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
            <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.rate > 10 ? '#34d399' : entry.rate > 3 ? '#fbbf24' : '#a1a1aa'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RatioTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-zinc-200 px-4 py-3">
      <p className="text-xs font-semibold text-zinc-900">{d.fullName}</p>
      <p className="text-xs text-zinc-600 mt-1">Selection: {d.rate}%</p>
      <p className="text-xs text-zinc-400">Avg CTC: ₹{d.ctc}L</p>
    </div>
  );
}
