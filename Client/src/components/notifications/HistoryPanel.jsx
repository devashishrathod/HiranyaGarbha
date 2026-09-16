import { useMemo, useState } from "react";
import { Ban, CopyPlus, History, Search } from "lucide-react";

import {
  CHANNEL_META,
  CHANNEL_ORDER,
  DELIVERY_STATUS,
  DELIVERY_STATUS_META,
  DELIVERY_STATUS_OPTIONS,
} from "../../constants/notification";
import { formatDateTime } from "../../utils/datetime";
import { EmptyState, MeterBar, Pill, Select } from "../UI/kit";

const percent = (part, whole) =>
  whole > 0 ? Math.round((part / whole) * 100) : 0;

/**
 * Log of everything that has gone out, with a delivery meter per campaign and
 * the two follow-up actions an admin actually needs: re-use the copy, or stop
 * something that has not left yet.
 */
const HistoryPanel = ({ history = [], onDuplicate, onCancel }) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [channel, setChannel] = useState("");

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return history.filter((item) => {
      if (status && item.status !== status) return false;
      if (channel && !item.channels.includes(channel)) return false;
      if (!needle) return true;

      return (
        item.title?.toLowerCase().includes(needle) ||
        item.body?.toLowerCase().includes(needle) ||
        item.audienceLabel?.toLowerCase().includes(needle)
      );
    });
  }, [history, search, status, channel]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, message or audience"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Select
          className="sm:w-44"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="">All statuses</option>
          {DELIVERY_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Select
          className="sm:w-44"
          value={channel}
          onChange={(event) => setChannel(event.target.value)}
        >
          <option value="">All channels</option>
          {CHANNEL_ORDER.map((key) => (
            <option key={key} value={key}>
              {CHANNEL_META[key].label}
            </option>
          ))}
        </Select>
      </div>

      {!rows.length ? (
        <EmptyState
          icon={History}
          title="Nothing here"
          message={
            history.length
              ? "No campaign matches these filters."
              : "Notifications you send will be listed here."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3">Notification</th>
                <th className="px-5 py-3">Channels</th>
                <th className="px-5 py-3">Audience</th>
                <th className="px-5 py-3 w-48">Delivery</th>
                <th className="px-5 py-3">When</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((item) => {
                const statusMeta =
                  DELIVERY_STATUS_META[item.status] ||
                  DELIVERY_STATUS_META[DELIVERY_STATUS.SENT];
                const isScheduled = item.status === DELIVERY_STATUS.SCHEDULED;

                return (
                  <tr key={item._id} className="align-top hover:bg-blue-50/30">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">
                        {item.title || "Untitled"}
                      </p>
                      <p className="mt-0.5 line-clamp-2 max-w-md text-xs text-gray-500">
                        {item.body}
                      </p>
                      {item.error ? (
                        <p className="mt-1 text-xs font-medium text-red-600">
                          {item.error}
                        </p>
                      ) : null}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.channels.map((key) => (
                          <Pill key={key} tone={CHANNEL_META[key]?.tone}>
                            {CHANNEL_META[key]?.label || key}
                          </Pill>
                        ))}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="max-w-[14rem] text-gray-800">
                        {item.audienceLabel}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {item.targeted} targeted
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <Pill tone={statusMeta.tone}>{statusMeta.label}</Pill>
                      {isScheduled ? null : (
                        <div className="mt-2 space-y-1">
                          <MeterBar
                            value={item.delivered}
                            max={item.targeted || 1}
                            label={`${item.delivered} of ${item.targeted} delivered`}
                          />
                          <p className="text-[11px] text-gray-500">
                            {item.delivered} delivered ·{" "}
                            {percent(item.opened, item.targeted)}% opened
                            {item.failed ? ` · ${item.failed} failed` : ""}
                          </p>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-xs text-gray-600">
                      {isScheduled ? (
                        <>
                          <p className="font-medium text-blue-700">
                            {formatDateTime(item.scheduledAt)}
                          </p>
                          <p className="text-gray-400">scheduled</p>
                        </>
                      ) : (
                        <>
                          <p>{formatDateTime(item.sentAt || item.createdAt)}</p>
                          <p className="text-gray-400">by {item.sentBy}</p>
                        </>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="Use this copy again"
                          onClick={() => onDuplicate?.(item)}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <CopyPlus size={17} />
                        </button>
                        {isScheduled ? (
                          <button
                            type="button"
                            title="Cancel this schedule"
                            onClick={() => onCancel?.(item)}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          >
                            <Ban size={17} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;
