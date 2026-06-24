'use client';

import {
  Area,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DailyPoint } from '@/lib/admin/gsc';
import { AXIS_TICK, BRAND, chartNum, fmtChartDate, TOOLTIP_STYLE } from './format';

// Daily Search Console trend: clicks as a burgundy area (left axis), impressions
// as a gold line (right axis). New on the SEO tab.
export function SearchTrendChart({ data }: { data: DailyPoint[] }) {
  if (data.length < 2) {
    return <p className="text-base text-graphite">Not enough days yet to draw a trend.</p>;
  }
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="clicksFill" x1="0" y1="0" x2="0" y2="1">
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
            yAxisId="left"
            allowDecimals={false}
            width={40}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            allowDecimals={false}
            width={40}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelFormatter={(l) => fmtChartDate(String(l))}
            formatter={(value, name) =>
              [chartNum.format(Number(value)), String(name)] as [string, string]
            }
          />
          <Legend
            verticalAlign="top"
            height={24}
            iconType="plainline"
            formatter={(value) => <span className="text-[14px] text-charcoal">{value}</span>}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="clicks"
            name="Clicks"
            stroke={BRAND.burgundy}
            strokeWidth={2}
            fill="url(#clicksFill)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="impressions"
            name="Shown"
            stroke={BRAND.gold}
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
