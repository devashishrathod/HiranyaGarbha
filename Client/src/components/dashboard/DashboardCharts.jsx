import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useEffect, useRef, useState } from "react";

export const ChartShell = ({ children }) => {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  const height = 280;

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;
    const update = () => {
      const next = Math.floor(el.getBoundingClientRect().width);
      setWidth(next);
    };

    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full" style={{ height }}>
      {width > 0 ? children({ width, height }) : null}
    </div>
  );
};

const EmptyChart = () => {
  return (
    <div
      className="flex h-72 min-h-72 w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/40 text-sm text-slate-600"
      style={{ height: 280 }}
    >
      No chart data available.
    </div>
  );
};

export const AppointmentsTrendChart = ({ data }) => {
  if (!data?.length) return <EmptyChart />;
  return (
    <ChartShell>
      {({ width, height }) => (
        <AreaChart
          width={width}
          height={height}
          data={data}
          margin={{ left: 8, right: 8, top: 10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="booked" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="completed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="booked"
            stroke="#10b981"
            fill="url(#booked)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="completed"
            stroke="#6366f1"
            fill="url(#completed)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="cancelled"
            stroke="#f43f5e"
            fillOpacity={0}
            strokeWidth={2}
          />
        </AreaChart>
      )}
    </ChartShell>
  );
};

export const SessionsStackChart = ({ data }) => {
  if (!data?.length) return <EmptyChart />;
  return (
    <ChartShell>
      {({ width, height }) => (
        <BarChart
          width={width}
          height={height}
          data={data}
          margin={{ left: 8, right: 8, top: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            dataKey="scheduled"
            stackId="a"
            fill="#8b5cf6"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="live"
            stackId="a"
            fill="#22c55e"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="completed"
            stackId="a"
            fill="#0ea5e9"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      )}
    </ChartShell>
  );
};
