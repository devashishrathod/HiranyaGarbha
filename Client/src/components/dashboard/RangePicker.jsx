import { useState } from "react";
import { CalendarRange } from "lucide-react";

import {
  DASHBOARD_MAX_CUSTOM_DAYS,
  DASHBOARD_RANGES,
  RANGE_OPTIONS,
} from "../../constants/dashboard";
import { toDateInputValue, todayInputValue } from "../../utils/datetime";

const DAY_MS = 24 * 60 * 60 * 1000;

const daysBetween = (from, to) =>
  Math.round((new Date(to).getTime() - new Date(from).getTime()) / DAY_MS) + 1;

const customError = (from, to) => {
  if (!from || !to) return "Pick both dates";
  if (from > to) return "The start date must be before the end date";
  if (daysBetween(from, to) > DASHBOARD_MAX_CUSTOM_DAYS) {
    return `Pick at most ${DASHBOARD_MAX_CUSTOM_DAYS} days`;
  }
  return "";
};

/**
 * Today / 7 days / 30 days / 12 months, or a custom pair of dates.
 *
 * `value` is the applied query ({ range, from?, to? }). Choosing "Custom" only
 * opens the date fields — nothing is fetched until both dates are picked and
 * applied, so a half-filled range never hits the server.
 */
const RangePicker = ({ value, onChange }) => {
  const isCustom = value.range === DASHBOARD_RANGES.CUSTOM;
  const [customOpen, setCustomOpen] = useState(isCustom);
  // Lazy initialisers: the default draft is the last 30 days, read once.
  const [from, setFrom] = useState(
    () => value.from || toDateInputValue(new Date(Date.now() - 29 * DAY_MS)),
  );
  const [to, setTo] = useState(() => value.to || todayInputValue());

  const error = customError(from, to);
  const draftChanged = !isCustom || from !== value.from || to !== value.to;

  const pick = (range) => {
    if (range === DASHBOARD_RANGES.CUSTOM) {
      setCustomOpen(true);
      return;
    }
    setCustomOpen(false);
    onChange({ range });
  };

  const apply = (event) => {
    event.preventDefault();
    if (error) return;
    onChange({ range: DASHBOARD_RANGES.CUSTOM, from, to });
  };

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div
        role="group"
        aria-label="Date range"
        className="flex flex-wrap gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm"
      >
        {RANGE_OPTIONS.map((option) => {
          const active =
            option.value === DASHBOARD_RANGES.CUSTOM
              ? customOpen
              : !customOpen && value.range === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => pick(option.value)}
              className={`inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 text-sm font-medium transition-all ${
                active
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {option.value === DASHBOARD_RANGES.CUSTOM ? (
                <CalendarRange size={15} aria-hidden="true" />
              ) : null}
              {option.label}
            </button>
          );
        })}
      </div>

      {customOpen ? (
        <form
          onSubmit={apply}
          className="flex flex-wrap items-end gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm"
        >
          <label className="flex flex-col text-xs font-medium text-gray-600">
            From
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(event) => setFrom(event.target.value)}
              className="mt-1 h-10 rounded-lg border border-gray-300 px-2.5 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="flex flex-col text-xs font-medium text-gray-600">
            To
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => setTo(event.target.value)}
              className="mt-1 h-10 rounded-lg border border-gray-300 px-2.5 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <button
            type="submit"
            disabled={Boolean(error) || !draftChanged}
            className="h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 text-sm font-medium text-white shadow-sm transition-all hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply
          </button>
          {error && from && to ? (
            <p className="w-full text-xs text-red-600">{error}</p>
          ) : null}
        </form>
      ) : null}
    </div>
  );
};

export default RangePicker;
