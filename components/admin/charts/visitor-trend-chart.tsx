'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TrendPoint } from '@/lib/admin/analytics';
import { AXIS_TICK, BRAND, chartNum, fmtChartDate, TOOLTIP_STYLE } from './format';

// Interactive replacement for the old hand-rolled SVG: axes, hover tooltip
// (exact visitors per day), responsive. On-brand burgundy area.
export function VisitorTrendChart({ data }: { data: TrendPoint[] }) {
  if (data.length < 2) {
    return <p className="text-base text-graphite">Not enough days yet to draw a trend.</p>;
  }
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="visitorsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND.burgundy} stopOpacity={0.18} />
              <stop offset="100%" stopColor={BRAND.burgundy} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={fmtChartDate}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            width={40}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelFormatter={(l) => fmtChartDate(String(l))}
            formatter={(value) => [chartNum.format(Number(value)), 'Visitors'] as [string, string]}
          />
          <Area
            type="monotone"
            dataKey="visitors"
            stroke={BRAND.burgundy}
            strokeWidth={2}
            fill="url(#visitorsFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
