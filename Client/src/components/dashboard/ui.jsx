import { useMemo } from "react";

export const cx = (...classes) => classes.filter(Boolean).join(" ");

export const formatTrend = (pct) => {
  if (!Number.isFinite(pct)) return { label: "0%", tone: "muted" };
  if (pct > 0) return { label: `+${pct}%`, tone: "up" };
  if (pct < 0) return { label: `${pct}%`, tone: "down" };
  return { label: "0%", tone: "muted" };
};

const toneToClasses = {
  up: "text-emerald-700 bg-emerald-50 ring-emerald-100",
  down: "text-rose-700 bg-rose-50 ring-rose-100",
  muted: "text-slate-600 bg-slate-50 ring-slate-100",
};

export const TrendChip = ({ pct, className }) => {
  const t = useMemo(() => formatTrend(pct), [pct]);
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        toneToClasses[t.tone],
        className
      )}
    >
      {t.label}
    </span>
  );
};

export const SectionHeader = ({ title, subtitle, right }) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
};
