import { TrendChip, cx } from "./ui";

const toneStyles = {
  indigo:
    "bg-gradient-to-br from-indigo-600 via-indigo-500 to-fuchsia-500 text-white",
  emerald:
    "bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 text-white",
  rose: "bg-gradient-to-br from-rose-600 via-pink-500 to-amber-400 text-white",
  violet:
    "bg-gradient-to-br from-violet-600 via-purple-500 to-indigo-500 text-white",
  slate:
    "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white",
};

export const KpiCard = ({
  title,
  value,
  icon,
  trendPct,
  subLabel,
  subValue,
  tone = "indigo",
}) => {
  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-2xl p-5 shadow-sm ring-1 ring-black/5",
        toneStyles[tone] || toneStyles.indigo
      )}
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
      <div className="absolute -left-10 -bottom-10 h-28 w-28 rounded-full bg-white/10" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-white/80 truncate">{title}</p>
          <div className="mt-1 flex items-end gap-2">
            <p className="text-2xl sm:text-3xl font-semibold tracking-tight">
              {value}
            </p>
            <TrendChip pct={trendPct} className="bg-white/15 text-white ring-white/20" />
          </div>
          {subLabel ? (
            <p className="mt-2 text-xs text-white/80">
              {subLabel}: <span className="font-semibold">{subValue}</span>
            </p>
          ) : null}
        </div>

        <div className="shrink-0 rounded-2xl bg-white/15 p-3 ring-1 ring-white/15">
          {icon}
        </div>
      </div>
    </div>
  );
};
