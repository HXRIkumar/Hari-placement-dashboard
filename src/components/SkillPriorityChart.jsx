"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const SKILL_LABELS = {
  dsa: 'DSA & Problem Solving',
  dev: 'Development & Projects',
  aptitude: 'Aptitude & Reasoning',
  core: 'Core CS Fundamentals',
};

const SKILL_COLORS = {
  dsa: '#6366f1',
  dev: '#06b6d4',
  aptitude: '#f59e0b',
  core: '#8b5cf6',
};

export default function SkillPriorityChart({ skillFocus, companyName }) {
  const data = Object.entries(skillFocus)
    .map(([key, value]) => ({
      skill: SKILL_LABELS[key] || key,
      weight: value,
      key,
    }))
    .sort((a, b) => b.weight - a.weight);

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-6">
      <h3 className="text-base font-semibold text-zinc-900 mb-1">Skill Priority</h3>
      <p className="text-xs text-zinc-400 mb-6">Estimated preparation weight for {companyName}</p>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barSize={20}>
            <XAxis
              type="number"
              domain={[0, 55]}
              tick={{ fontSize: 11, fill: '#a1a1aa' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="skill"
              width={170}
              tick={{ fontSize: 11, fill: '#71717a' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white rounded-lg shadow-lg border border-zinc-200 px-4 py-3">
                    <p className="text-xs font-semibold text-zinc-900">{d.skill}</p>
                    <p className="text-xs text-zinc-600 mt-1">Weight: {d.weight}%</p>
                  </div>
                );
              }}
              cursor={{ fill: 'rgba(0,0,0,0.03)' }}
            />
            <Bar dataKey="weight" radius={[0, 6, 6, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={SKILL_COLORS[entry.key] || '#a1a1aa'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
