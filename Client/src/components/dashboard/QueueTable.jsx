import { cx } from "./ui";
import { STATUSES } from "../../constants/appConstants";

const statusStyles = {
  [STATUSES.CONFIRMED]: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  [STATUSES.PENDING]: "bg-amber-50 text-amber-700 ring-amber-100",
  [STATUSES.NEW]: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  [STATUSES.ASSIGNED]: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  [STATUSES.RESOLVED]: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  [STATUSES.REPLIED]: "bg-slate-50 text-slate-700 ring-slate-100",
};

const StatusPill = ({ value }) => {
  const cls =
    statusStyles[value] || "bg-slate-50 text-slate-700 ring-slate-100";
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        cls,
      )}
    >
      {value}
    </span>
  );
};

export const QueueTable = ({ columns, rows, keyField = "id" }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-2 py-2">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={r[keyField]} className="hover:bg-slate-50/70">
              {columns.map((c) => {
                const value = r[c.key];
                if (c.key === "trendPct" && typeof value === "number") {
                  const cls =
                    value > 0
                      ? "text-emerald-700"
                      : value < 0
                        ? "text-rose-700"
                        : "text-slate-700";
                  return (
                    <td
                      key={c.key}
                      className={cx("px-2 py-3 font-semibold", cls)}
                    >
                      {value > 0 ? `+${value}%` : `${value}%`}
                    </td>
                  );
                }
                if (c.type === "status") {
                  return (
                    <td key={c.key} className="px-2 py-3">
                      <StatusPill value={value} />
                    </td>
                  );
                }
                return (
                  <td
                    key={c.key}
                    className={cx(
                      "px-2 py-3",
                      c.mono ? "font-mono text-xs" : "",
                    )}
                  >
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
