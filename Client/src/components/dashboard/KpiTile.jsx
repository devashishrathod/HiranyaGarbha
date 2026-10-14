import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

/**
 * Up / down / flat against the previous window. Direction is carried by the
 * arrow and the sign as well as the colour, so it never rests on colour alone.
 */
export const ChangeChip = ({ value, suffix = "%", text }) => {
  if (value === null || value === undefined) return null;

  const up = value > 0;
  const down = value < 0;
  const Icon = up ? ArrowUpRight : down ? ArrowDownRight : Minus;
  const tone = up
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : down
      ? "bg-red-50 text-red-700 ring-red-200"
      : "bg-gray-100 text-gray-600 ring-gray-200";

  const label =
    text ?? `${up ? "+" : down ? "−" : ""}${Math.abs(value).toLocaleString("en-IN")}${suffix}`;

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${tone}`}
    >
      <Icon size={13} aria-hidden="true" />
      {label}
    </span>
  );
};

const KpiTile = ({ label, value, icon: Icon, change, changeSuffix, changeText, hint }) => (
  <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
    <div className="flex items-start justify-between gap-3">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      {Icon ? (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-sm">
          <Icon size={19} aria-hidden="true" />
        </span>
      ) : null}
    </div>
    <p className="truncate text-2xl font-bold tracking-tight text-gray-900 sm:text-[28px]">
      {value}
    </p>
    <div className="flex min-h-[22px] flex-wrap items-center gap-2">
      <ChangeChip value={change} suffix={changeSuffix} text={changeText} />
      {hint ? <span className="text-xs text-gray-500">{hint}</span> : null}
    </div>
  </div>
);

export default KpiTile;
