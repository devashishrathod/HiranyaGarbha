import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CHART_COLORS } from "../../constants/dashboard";
import { formatCompactINR, formatINR, formatNumber } from "./format";

/**
 * Measures its own width and hands it to the chart. Used instead of
 * ResponsiveContainer, which renders at width -1 (and warns) when the card is
 * laid out after the chart mounts — the case on a lazily loaded route.
 */
const ChartShell = ({ height, children }) => {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const update = () => setWidth(Math.floor(element.getBoundingClientRect().width));
    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full" style={{ height }}>
      {width > 0 ? children({ width, height }) : null}
    </div>
  );
};

export const EmptyChart = ({ height, message }) => (
  <div
    className="flex w-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-6 text-center text-sm text-gray-500"
    style={{ height }}
  >
    {message}
  </div>
);

const AXIS_TICK = { fontSize: 11, fill: CHART_COLORS.axis };

const TooltipCard = ({ title, rows }) => (
  <div className="min-w-[160px] rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
    <p className="mb-1 font-medium text-gray-300">{title}</p>
    {rows.map((row) => (
      <div key={row.label} className="flex items-center gap-2 py-0.5">
        {row.color ? (
          <span className="h-2 w-2 rounded-sm" style={{ background: row.color }} />
        ) : null}
        <span className="text-gray-200">{row.label}</span>
        <span className="ml-auto pl-3 font-semibold tabular-nums">{row.value}</span>
      </div>
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/* Revenue                                                             */
/* ------------------------------------------------------------------ */

const RevenueTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <TooltipCard
      title={point.label}
      rows={[
        { label: "Revenue", value: formatINR(point.amount) },
        { label: "Payments", value: formatNumber(point.payments) },
      ]}
    />
  );
};

export const RevenueChart = ({ data = [], height = 260 }) => {
  if (!data.some((point) => point.amount > 0)) {
    return <EmptyChart height={height} message="No payments were captured in this period." />;
  }

  return (
    <ChartShell height={height}>
      {({ width }) => (
        <AreaChart
          width={width}
          height={height}
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            {/* userSpaceOnUse: a flat line has a zero-height bounding box,
                and a bounding-box gradient on it would not paint at all. */}
            <linearGradient
              id="dashRevenueStroke"
              gradientUnits="userSpaceOnUse"
              x1={0}
              y1={0}
              x2={width}
              y2={0}
            >
              <stop offset="0%" stopColor={CHART_COLORS.revenueFrom} />
              <stop offset="100%" stopColor={CHART_COLORS.revenueTo} />
            </linearGradient>
            <linearGradient id="dashRevenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
          <XAxis
            dataKey="label"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: "#d1d5db" }}
            interval="preserveStartEnd"
            minTickGap={18}
          />
          <YAxis
            width={58}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tickFormatter={formatCompactINR}
          />
          <Tooltip
            content={<RevenueTooltip />}
            cursor={{ stroke: "#9ca3af", strokeDasharray: "4 4" }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            name="Revenue"
            stroke="url(#dashRevenueStroke)"
            strokeWidth={2.5}
            fill="url(#dashRevenueFill)"
            dot={false}
            activeDot={{
              r: 5,
              fill: CHART_COLORS.revenueFrom,
              stroke: "#fff",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      )}
    </ChartShell>
  );
};

/* ------------------------------------------------------------------ */
/* Appointments                                                        */
/* ------------------------------------------------------------------ */

const APPOINTMENT_SERIES = [
  { key: "completed", label: "Completed", color: CHART_COLORS.completed },
  // Pending, confirmed, checked in or in progress. On a past day this is a
  // booking nobody closed, so it is "open", not "upcoming".
  { key: "open", label: "Open", color: CHART_COLORS.open },
  { key: "missed", label: "Cancelled / no-show", color: CHART_COLORS.missed },
];

export const AppointmentsLegend = () => (
  <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-gray-600">
    {APPOINTMENT_SERIES.map((series) => (
      <li key={series.key} className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: series.color }} />
        {series.label}
      </li>
    ))}
  </ul>
);

const AppointmentsTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <TooltipCard
      title={`${point.label} · ${formatNumber(point.total)} booked`}
      rows={APPOINTMENT_SERIES.map((series) => ({
        label: series.label,
        value: formatNumber(point[series.key]),
        color: series.color,
      }))}
    />
  );
};

export const AppointmentsChart = ({ data = [], height = 260 }) => {
  if (!data.some((point) => point.total > 0)) {
    return <EmptyChart height={height} message="No appointments in this period." />;
  }

  return (
    <ChartShell height={height}>
      {({ width }) => (
        <BarChart
          width={width}
          height={height}
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          barCategoryGap="22%"
        >
          <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
          <XAxis
            dataKey="label"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: "#d1d5db" }}
            interval="preserveStartEnd"
            minTickGap={18}
          />
          <YAxis
            width={40}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<AppointmentsTooltip />} cursor={{ fill: "rgba(99,102,241,0.06)" }} />
          {APPOINTMENT_SERIES.map((series, index) => (
            <Bar
              key={series.key}
              dataKey={series.key}
              name={series.label}
              stackId="appointments"
              fill={series.color}
              stroke="#fff"
              strokeWidth={1}
              maxBarSize={32}
              radius={index === APPOINTMENT_SERIES.length - 1 ? [4, 4, 0, 0] : 0}
            />
          ))}
        </BarChart>
      )}
    </ChartShell>
  );
};

/* ------------------------------------------------------------------ */
/* Plan mix                                                            */
/* ------------------------------------------------------------------ */

const PlanTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const slice = payload[0].payload;
  if (!slice.label) return null;

  return (
    <TooltipCard
      title={slice.label}
      rows={[{ label: "Patients", value: formatNumber(slice.count), color: slice.color }]}
    />
  );
};

export const PlanDonut = ({ slices = [], total = 0, size = 176 }) => {
  // Zero slices still take their padding angle, so drop them; an empty mix
  // draws one grey ring instead of nothing.
  const visible = slices.filter((slice) => slice.count > 0);
  const data = visible.length ? visible : [{ count: 1, color: "#e5e7eb" }];

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          dataKey="count"
          nameKey="label"
          innerRadius={size * 0.34}
          outerRadius={size * 0.48}
          paddingAngle={visible.length > 1 ? 2 : 0}
          startAngle={90}
          endAngle={-270}
          stroke="none"
        >
          {data.map((slice, index) => (
            <Cell key={slice.label || index} fill={slice.color} />
          ))}
        </Pie>
        {visible.length ? <Tooltip content={<PlanTooltip />} /> : null}
      </PieChart>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{formatNumber(total)}</span>
        <span className="text-xs text-gray-500">active plans</span>
      </div>
    </div>
  );
};
