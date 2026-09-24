import { Ban, CopyPlus, History, RotateCcw, Search } from "lucide-react";

import {
  CHANNEL_META,
  CHANNEL_ORDER,
  DELIVERY_STATUS,
  DELIVERY_STATUS_META,
  DELIVERY_STATUS_OPTIONS,
} from "../../constants/notification";
import { formatDateTime } from "../../utils/datetime";
import Pagination from "../UI/Pagination";
import {
  Button,
  EmptyState,
  MeterBar,
  Pill,
  Select,
  SkeletonRows,
} from "../UI/kit";

/**
 * What a campaign row actually delivered.
 *
 * ⚠️ `stats.push.noDevice` is reported separately from `push.failed`, and this
 * is the distinction that matters: a patient who has never opened the mobile
 * app has no token to push to. Folding that into "failed" would show almost
 * every early campaign as broken.
 */
const deliverySummary = (item) => {
  const push = item.stats?.push || {};
  const email = item.stats?.email || {};

  const delivered = (push.sent || 0) + (email.sent || 0);
  const failed = (push.failed || 0) + (email.failed || 0);

  return {
    recorded: item.stats?.created || 0,
    targeted: item.stats?.targeted || 0,
    delivered,
    failed,
    noDevice: push.noDevice || 0,
    parts: [
      push.sent ? `${push.sent} push` : null,
      email.sent ? `${email.sent} email` : null,
    ].filter(Boolean),
  };
};

/**
 * Log of everything that has gone out, with a delivery meter per campaign and
 * the two follow-up actions an admin actually needs: re-use the copy, or stop
 * something that has not left yet.
 *
 * Filtering and paging happen on the server, so this renders whatever page it
 * is handed rather than slicing a local array — the history grows without
 * bound and a client-side filter would only ever search the page on screen.
 */
const HistoryPanel = ({
  campaigns = [],
  filters,
  onFiltersChange,
  page,
  totalPages,
  onPageChange,
  isLoading,
  isEmpty,
  error,
  onRetry,
  onDuplicate,
  onCancel,
  cancellingId,
}) => {
  const patch = (changes) => onFiltersChange({ ...filters, ...changes });

  const renderBody = () => {
    if (isLoading) return <SkeletonRows rows={5} />;

    if (error) {
      return (
        <EmptyState
          icon={History}
          title="Could not load the history"
          message={error?.response?.data?.message || error.message}
          action={
            <Button variant="secondary" icon={RotateCcw} onClick={onRetry}>
              Try again
            </Button>
          }
        />
      );
    }

    if (isEmpty) {
      const filtered =
        filters.search || filters.status || filters.channel;

      return (
        <EmptyState
          icon={History}
          title={filtered ? "Nothing matches" : "Nothing sent yet"}
          message={
            filtered
              ? "No campaign matches these filters."
              : "Notifications you send will be listed here."
          }
          action={
            filtered ? (
              <Button
                variant="secondary"
                onClick={() =>
                  onFiltersChange({ search: "", status: "", channel: "" })
                }
              >
                Clear filters
              </Button>
            ) : null
          }
        />
      );
    }

    return (
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-3">Notification</th>
              <th className="px-5 py-3">Channels</th>
              <th className="px-5 py-3">Audience</th>
              <th className="w-52 px-5 py-3">Delivery</th>
              <th className="px-5 py-3">When</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {campaigns.map((item) => {
              const statusMeta =
                DELIVERY_STATUS_META[item.status] ||
                DELIVERY_STATUS_META[DELIVERY_STATUS.SENT];
              const isScheduled = item.status === DELIVERY_STATUS.SCHEDULED;
              const isSending = item.status === DELIVERY_STATUS.SENDING;
              const summary = deliverySummary(item);

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
                      {(item.channels || []).map((key) => (
                        <Pill key={key} tone={CHANNEL_META[key]?.tone}>
                          {CHANNEL_META[key]?.label || key}
                        </Pill>
                      ))}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="max-w-[14rem] text-gray-800">
                      {item.audienceLabel || "—"}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {summary.targeted} targeted
                      {summary.recorded && summary.recorded !== summary.targeted
                        ? ` · ${summary.recorded} recorded`
                        : ""}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <Pill tone={statusMeta.tone}>{statusMeta.label}</Pill>

                    {isScheduled || isSending ? null : (
                      <div className="mt-2 space-y-1">
                        <MeterBar
                          value={summary.delivered}
                          max={summary.targeted || 1}
                          label={`${summary.delivered} of ${summary.targeted} delivered`}
                        />
                        <p className="text-[11px] leading-relaxed text-gray-500">
                          {summary.parts.length
                            ? summary.parts.join(" · ")
                            : "nothing delivered"}
                          {summary.failed ? ` · ${summary.failed} failed` : ""}
                        </p>
                        {summary.noDevice ? (
                          <p className="text-[11px] text-gray-400">
                            {summary.noDevice} had no registered device
                          </p>
                        ) : null}
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
                        <p>{formatDateTime(item.completedAt || item.createdAt)}</p>
                        <p className="text-gray-400">
                          by {item.sentBy || "Admin"}
                        </p>
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
                          disabled={cancellingId === item._id}
                          onClick={() => onCancel?.(item)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-40"
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
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={filters.search}
            onChange={(event) => patch({ search: event.target.value })}
            placeholder="Search by title, message or audience"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Select
          className="sm:w-44"
          value={filters.status}
          onChange={(event) => patch({ status: event.target.value })}
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
          value={filters.channel}
          onChange={(event) => patch({ channel: event.target.value })}
        >
          <option value="">All channels</option>
          {CHANNEL_ORDER.map((key) => (
            <option key={key} value={key}>
              {CHANNEL_META[key].label}
            </option>
          ))}
        </Select>
      </div>

      {renderBody()}

      {totalPages > 1 ? (
        <div className="flex justify-end">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      ) : null}
    </div>
  );
};

export default HistoryPanel;
