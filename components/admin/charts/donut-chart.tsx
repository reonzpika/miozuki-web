'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { Slice } from '@/lib/admin/analytics';
import { chartNum, DONUT_PALETTE, TOOLTIP_STYLE } from './format';

// Reusable donut for { label, value } slices (device breakdown, new-vs-returning).
export function DonutChart({ data, unit = 'visitors' }: { data: Slice[]; unit?: string }) {
  if (!data.length) {
    return <p className="text-base text-graphite">No data yet.</p>;
  }
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((s, i) => (
              <Cell key={s.label} fill={DONUT_PALETTE[i % DONUT_PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value, name) =>
              [`${chartNum.format(Number(value))} ${unit}`, String(name)] as [string, string]
            }
          />
          <Legend
            verticalAlign="bottom"
            height={24}
            iconType="circle"
            formatter={(value) => (
              <span className="text-[14px] text-charcoal capitalize">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
