"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function PackageDistribution({ data }) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-6">
      <h3 className="text-base font-semibold text-zinc-900 mb-1">Package Distribution</h3>
      <p className="text-xs text-zinc-400 mb-6">Number of companies by CTC range</p>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4}>
            <XAxis
              dataKey="range"
              tick={{ fontSize: 11, fill: '#a1a1aa' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#a1a1aa' }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
            <Bar dataKey="safeCount" name="Safe" stackId="a" radius={[0, 0, 0, 0]} fill="#34d399" />
            <Bar dataKey="borderlineCount" name="Borderline" stackId="a" radius={[4, 4, 0, 0]} fill="#fbbf24" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-emerald-400" />
          <span className="text-xs text-zinc-500">Safe Target</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-amber-400" />
          <span className="text-xs text-zinc-500">Borderline</span>
        </div>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  const safe = payload.find((p) => p.name === 'Safe')?.value || 0;
  const borderline = payload.find((p) => p.name === 'Borderline')?.value || 0;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-zinc-200 px-4 py-3">
      <p className="text-xs font-semibold text-zinc-900 mb-1">{label}</p>
      <p className="text-xs text-emerald-600">Safe: {safe}</p>
      <p className="text-xs text-amber-500">Borderline: {borderline}</p>
      <p className="text-xs text-zinc-400 mt-1">Total: {safe + borderline}</p>
    </div>
  );
}
