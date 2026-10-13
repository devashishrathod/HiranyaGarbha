import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, CheckCheck, RotateCcw } from "lucide-react";

import API_ENDPOINTS from "../../api/apiEndpoint";
import { useApiMutation, useGetQuery } from "../../api/apiCall";
import { buildQuery, withPath } from "../../utils/ids";
import { formatDateTime, relativeDay, formatTime } from "../../utils/datetime";

const FEED_KEY = ["my-notifications"];
const UNREAD_KEY = ["my-notifications-unread"];

// The list endpoint answers 404 when the feed is empty — that is not a failure.
const isNotFound = (error) => error?.response?.status === 404;

const whenLabel = (value) => {
  const day = relativeDay(value);
  return day === "Today" || day === "Yesterday"
    ? `${day}, ${formatTime(value)}`
    : formatDateTime(value);
};

/**
 * The header bell: the logged-in user's own feed from `/notifications/my`.
 *
 * The badge polls the cheap unread-count endpoint; the list itself is only
 * fetched while the panel is open, so an idle header is one tiny request a
 * minute rather than a full page of notifications.
 */
const NotificationBell = ({ showManageLink = false }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: unreadData } = useGetQuery(
    API_ENDPOINTS.NOTIFICATIONS.MY.UNREAD_COUNT,
    UNREAD_KEY,
    { refetchInterval: 60000 },
  );
  const unread = unreadData?.data?.unread || 0;

  const {
    data: feedData,
    isLoading,
    error,
    refetch,
  } = useGetQuery(
    `${API_ENDPOINTS.NOTIFICATIONS.MY.LIST}${buildQuery({ page: 1, limit: 20 })}`,
    FEED_KEY,
    {
      enabled: open,
      retry: (count, err) => !isNotFound(err) && count < 2,
    },
  );

  const items = isNotFound(error) ? [] : feedData?.data?.data || [];
  const hardError = error && !isNotFound(error) ? error : null;

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: FEED_KEY });
    queryClient.invalidateQueries({ queryKey: UNREAD_KEY });
  };

  const { mutate: markRead } = useApiMutation({
    method: "patch",
    toastOnError: false,
    onSuccess: refresh,
  });
  const { mutate: markAllRead, isPending: markingAll } = useApiMutation({
    method: "patch",
    onSuccess: refresh,
  });

  const handleItemClick = (item) => {
    if (item.isRead) return;
    markRead({
      url: withPath(API_ENDPOINTS.NOTIFICATIONS.MY.READ, { id: item._id }),
    });
  };

  const renderBody = () => {
    if (isLoading) {
      return (
        <div className="space-y-3 p-4">
          {[0, 1, 2].map((key) => (
            <div key={key} className="animate-pulse space-y-2">
              <div className="h-3 w-2/3 rounded bg-gray-200" />
              <div className="h-3 w-full rounded bg-gray-100" />
            </div>
          ))}
        </div>
      );
    }

    if (hardError) {
      return (
        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
          <p className="text-sm text-gray-600">Could not load notifications.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <RotateCcw size={14} /> Try again
          </button>
        </div>
      );
    }

    if (!items.length) {
      return (
        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
          <BellOff size={28} className="text-gray-300" />
          <p className="text-sm text-gray-500">No notifications yet</p>
        </div>
      );
    }

    return (
      <ul className="divide-y divide-gray-100">
        {items.map((item) => (
          <li key={item._id}>
            <button
              type="button"
              onClick={() => handleItemClick(item)}
              className={`flex w-full gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-gray-50 ${
                item.isRead ? "" : "bg-blue-50/50"
              }`}
            >
              <span
                className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                  item.isRead ? "bg-transparent" : "bg-blue-500"
                }`}
              />
              <span className="min-w-0 flex-1">
                <span
                  className={`block truncate text-sm ${
                    item.isRead
                      ? "text-gray-700"
                      : "font-semibold text-gray-900"
                  }`}
                >
                  {item.title || "Notification"}
                </span>
                {item.body ? (
                  <span className="mt-0.5 block line-clamp-2 text-xs text-gray-500">
                    {item.body}
                  </span>
                ) : null}
                <span className="mt-1 block text-[11px] text-gray-400">
                  {whenLabel(item.createdAt)}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Notifications"
        className="relative p-2 text-gray-500 rounded-full hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 group"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 ? (
          <span className="absolute -top-1 -right-1 min-w-[1rem] h-4 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 border border-gray-100">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="font-semibold text-gray-800">
              Notifications
              {unread > 0 ? (
                <span className="ml-2 text-xs font-medium text-gray-500">
                  {unread} unread
                </span>
              ) : null}
            </p>
            {unread > 0 ? (
              <button
                type="button"
                disabled={markingAll}
                onClick={() =>
                  markAllRead({ url: API_ENDPOINTS.NOTIFICATIONS.MY.READ_ALL })
                }
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-96 overflow-y-auto">{renderBody()}</div>

          {showManageLink ? (
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-center text-sm font-medium text-blue-600 border-t border-gray-100 hover:bg-gray-50"
            >
              Send a notification
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
};

NotificationBell.propTypes = {
  showManageLink: PropTypes.bool,
};

export default NotificationBell;
