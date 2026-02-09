import {
  TIME_PERIODS,
  TIME_PERIOD_OPTIONS,
} from "../../constants/appConstants";

export const RangeFilter = ({
  value,
  onChange,
  startDate,
  endDate,
  onDateChange,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-slate-600">Period</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-indigo-300"
      >
        {TIME_PERIOD_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {value === TIME_PERIODS.CUSTOM ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={startDate || ""}
            onChange={(e) =>
              onDateChange?.({ startDate: e.target.value, endDate })
            }
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <span className="text-xs text-slate-500">to</span>
          <input
            type="date"
            value={endDate || ""}
            onChange={(e) =>
              onDateChange?.({ startDate, endDate: e.target.value })
            }
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      ) : null}
    </div>
  );
};
