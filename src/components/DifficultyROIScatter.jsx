"use client";

import { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function DifficultyROIScatter({ allProfiles, currentCompany }) {
  const data = useMemo(() => {
    return allProfiles
      .filter((p) => p.eligibility.status === 'safe' && p.avgCTC > 0)
      .map((p) => ({
        x: p.difficulty,
        y: p.avgCTC,
        name: p.name,
        isCurrent: p.id === currentCompany.id,
        domain: p.domain,
      }));
  }, [allProfiles, currentCompany]);

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-6">
      <h3 className="text-base font-semibold text-zinc-900 mb-1">Difficulty vs Package</h3>
      <p className="text-xs text-zinc-400 mb-6">Where {currentCompany.name} sits relative to other accessible companies</p>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
            <XAxis
              type="number"
              dataKey="x"
              name="Difficulty"
              domain={[0, 10]}
              tick={{ fontSize: 11, fill: '#a1a1aa' }}
              axisLine={false}
              tickLine={false}
              label={{ value: 'Difficulty →', position: 'bottom', fontSize: 10, fill: '#a1a1aa', offset: -5 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="CTC"
              tick={{ fontSize: 11, fill: '#a1a1aa' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v}L`}
            />
            <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={data} shape="circle">
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.isCurrent ? '#2563eb' : '#d4d4d8'}
                  r={entry.isCurrent ? 8 : 4}
                  stroke={entry.isCurrent ? '#1d4ed8' : 'none'}
                  strokeWidth={entry.isCurrent ? 2 : 0}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600" />
          <span className="text-xs text-zinc-500">{currentCompany.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-zinc-300" />
          <span className="text-xs text-zinc-500">Other safe targets</span>
        </div>
      </div>
    </div>
  );
}

function ScatterTooltip({ active, payload }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-zinc-200 px-4 py-3">
      <p className="text-xs font-semibold text-zinc-900">{d.name}</p>
      <p className="text-xs text-zinc-600 mt-1">Difficulty: {d.x}/10</p>
      <p className="text-xs text-zinc-600">CTC: ₹{d.y}L</p>
      <p className="text-xs text-zinc-400">{d.domain}</p>
    </div>
  );
}
