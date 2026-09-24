import { useEffect, useMemo } from "react";
import {
  AlertTriangle,
  ClipboardList,
  Filter,
  ListChecks,
  Users,
} from "lucide-react";

import { usePostQuery } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import {
  AUDIENCE_GROUPS,
  AUDIENCE_MODES,
  AUDIENCE_MODE_META,
  DEFAULT_SEGMENT,
  LISTABLE_GROUPS,
  SEGMENT_STATUS_OPTIONS,
  buildAudienceTarget,
  hasAudienceInput,
  parseRecipientList,
} from "../../constants/notification";
import { Input, Pill, Select, Textarea } from "../UI/kit";
import RecipientPicker from "./RecipientPicker";

const MODE_ICONS = {
  [AUDIENCE_MODES.ROLE]: Users,
  [AUDIENCE_MODES.SEGMENT]: Filter,
  [AUDIENCE_MODES.MANUAL]: ListChecks,
  [AUDIENCE_MODES.CSV]: ClipboardList,
};

const AudienceBuilder = ({ value, onChange, onResolve }) => {
  const patch = (changes) => onChange({ ...value, ...changes });

  const target = useMemo(() => buildAudienceTarget(value), [value]);
  const enabled = hasAudienceInput(value);

  /**
   * ⚠️ The count comes from the notifications API, not from the patient and
   * doctor list endpoints.
   *
   * It runs the **same `resolveAudience` the send runs**, so the number on the
   * confirm dialog cannot disagree with who actually receives it. Counting
   * through `/patients/get-all` was a second implementation of the same
   * question, and a second implementation is a number that drifts.
   */
  const { data, isFetching, error } = usePostQuery(
    enabled ? API_ENDPOINTS.NOTIFICATIONS.AUDIENCE_COUNT : null,
    target,
    ["notification-audience", target],
    { enabled, keepPreviousData: true },
  );

  const resolved = data?.data;

  /** Per-role counts for the role cards, one request each, cached by target. */
  const patientCount = usePostQuery(
    API_ENDPOINTS.NOTIFICATIONS.AUDIENCE_COUNT,
    { mode: AUDIENCE_MODES.ROLE, roles: ["user"] },
    ["notification-audience", "count", "user"],
    { staleTime: 60000 },
  );
  const doctorCount = usePostQuery(
    API_ENDPOINTS.NOTIFICATIONS.AUDIENCE_COUNT,
    { mode: AUDIENCE_MODES.ROLE, roles: ["doctor"] },
    ["notification-audience", "count", "doctor"],
    { staleTime: 60000 },
  );
  const staffCount = usePostQuery(
    API_ENDPOINTS.NOTIFICATIONS.AUDIENCE_COUNT,
    { mode: AUDIENCE_MODES.ROLE, roles: ["staff"] },
    ["notification-audience", "count", "staff"],
    { staleTime: 60000 },
  );
  const adminCount = usePostQuery(
    API_ENDPOINTS.NOTIFICATIONS.AUDIENCE_COUNT,
    { mode: AUDIENCE_MODES.ROLE, roles: ["admin"] },
    ["notification-audience", "count", "admin"],
    { staleTime: 60000 },
  );

  const groupCounts = {
    PATIENTS: patientCount.data?.data?.total,
    DOCTORS: doctorCount.data?.data?.total,
    STAFF: staffCount.data?.data?.total,
    ADMINS: adminCount.data?.data?.total,
  };

  const csvParsed = useMemo(() => parseRecipientList(value.csv), [value.csv]);

  const summary = useMemo(
    () => ({
      mode: value.mode,
      label: resolved?.label || "No one selected",
      count: enabled ? resolved?.total || 0 : 0,
      truncated: Boolean(resolved?.truncated),
      cap: resolved?.cap,
      unmatched: resolved?.unmatched || 0,
      externalEmails: resolved?.externalEmails || 0,
      loading: isFetching,
    }),
    [value.mode, resolved, enabled, isFetching],
  );

  // Deps stay primitive so the parent is only told when something really moved.
  useEffect(() => {
    onResolve(summary);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    summary.mode,
    summary.label,
    summary.count,
    summary.truncated,
    summary.unmatched,
    summary.externalEmails,
    summary.loading,
  ]);

  const toggleGroup = (key) => {
    patch({
      groups: value.groups.includes(key)
        ? value.groups.filter((item) => item !== key)
        : [...value.groups, key],
    });
  };

  return (
    <div className="space-y-4">
      {/* Mode switch */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1 sm:grid-cols-4">
        {Object.values(AUDIENCE_MODES).map((mode) => {
          const Icon = MODE_ICONS[mode];
          const isActive = value.mode === mode;

          return (
            <button
              key={mode}
              type="button"
              onClick={() => patch({ mode })}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon size={15} />
              {AUDIENCE_MODE_META[mode].label}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-500">
        {AUDIENCE_MODE_META[value.mode].description}
      </p>

      {/* By role ------------------------------------------------------ */}
      {value.mode === AUDIENCE_MODES.ROLE ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {AUDIENCE_GROUPS.map((group) => {
            const isActive = value.groups.includes(group.key);
            const total = groupCounts[group.key];

            return (
              <button
                key={group.key}
                type="button"
                onClick={() => toggleGroup(group.key)}
                aria-pressed={isActive}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                  isActive
                    ? "border-blue-500 bg-blue-50/60 ring-1 ring-blue-500"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  readOnly
                  checked={isActive}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {group.label}
                    </p>
                    <Pill tone={group.tone}>
                      {typeof total === "number" ? total : "…"}
                    </Pill>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {group.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      ) : null}

      {/* By filter ---------------------------------------------------- */}
      {value.mode === AUDIENCE_MODES.SEGMENT ? (
        <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Select
              label="Audience"
              value={value.segmentGroup}
              onChange={(event) => patch({ segmentGroup: event.target.value })}
            >
              {LISTABLE_GROUPS.map((group) => (
                <option key={group.key} value={group.key}>
                  {group.label}
                </option>
              ))}
            </Select>

            <Select
              label="Account status"
              value={value.segment.status}
              onChange={(event) =>
                patch({
                  segment: { ...value.segment, status: event.target.value },
                })
              }
            >
              {SEGMENT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <Input
              label="Keyword"
              placeholder="Name, email or phone"
              value={value.segment.search}
              onChange={(event) =>
                patch({
                  segment: { ...value.segment, search: event.target.value },
                })
              }
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Joined from"
                type="date"
                value={value.segment.fromDate}
                onChange={(event) =>
                  patch({
                    segment: { ...value.segment, fromDate: event.target.value },
                  })
                }
              />
              <Input
                label="Joined to"
                type="date"
                value={value.segment.toDate}
                onChange={(event) =>
                  patch({
                    segment: { ...value.segment, toDate: event.target.value },
                  })
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg bg-white px-4 py-3 ring-1 ring-inset ring-gray-200">
            <p className="text-sm text-gray-600">Matching this filter</p>
            <p className="text-lg font-bold text-gray-900">
              {isFetching ? "…" : summary.count}
            </p>
          </div>

          <button
            type="button"
            onClick={() => patch({ segment: DEFAULT_SEGMENT })}
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            Reset filters
          </button>
        </div>
      ) : null}

      {/* Pick from list ----------------------------------------------- */}
      {value.mode === AUDIENCE_MODES.MANUAL ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            {LISTABLE_GROUPS.map((group) => (
              <button
                key={group.key}
                type="button"
                onClick={() => patch({ manualGroup: group.key })}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  value.manualGroup === group.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>

          <RecipientPicker
            key={value.manualGroup}
            group={value.manualGroup}
            selected={value.selected}
            onChange={(selected) => patch({ selected })}
          />
        </div>
      ) : null}

      {/* Paste list --------------------------------------------------- */}
      {value.mode === AUDIENCE_MODES.CSV ? (
        <div className="space-y-3">
          <Textarea
            label="Emails or mobile numbers"
            rows={7}
            value={value.csv}
            onChange={(event) => patch({ csv: event.target.value })}
            placeholder={
              "9876543210, 9812345678\nasha@example.com\n+91 98765 43210"
            }
          />
          <p className="text-xs text-gray-500">
            Separate entries with a comma, a space or a new line. Duplicates are
            dropped automatically.
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-teal-50 px-3 py-2 text-center ring-1 ring-inset ring-teal-200">
              <p className="text-lg font-bold text-teal-700">
                {csvParsed.emails.length}
              </p>
              <p className="text-[11px] text-teal-700">emails</p>
            </div>
            <div className="rounded-lg bg-blue-50 px-3 py-2 text-center ring-1 ring-inset ring-blue-200">
              <p className="text-lg font-bold text-blue-700">
                {csvParsed.phones.length}
              </p>
              <p className="text-[11px] text-blue-700">numbers</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2 text-center ring-1 ring-inset ring-gray-200">
              <p className="text-lg font-bold text-gray-700">
                {csvParsed.invalid.length}
              </p>
              <p className="text-[11px] text-gray-600">unreadable</p>
            </div>
          </div>

          {csvParsed.invalid.length ? (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-inset ring-amber-200">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <p className="min-w-0 break-words">
                Skipped: {csvParsed.invalid.slice(0, 12).join(", ")}
                {csvParsed.invalid.length > 12
                  ? ` and ${csvParsed.invalid.length - 12} more`
                  : ""}
              </p>
            </div>
          ) : null}

          {/*
            The server answers with what it could actually match, which is the
            only place this can be known: a pasted address that belongs to no
            account can still be emailed, but it gets no in-app row, and a
            pasted number with no account reaches nobody at all.
          */}
          {summary.unmatched || summary.externalEmails ? (
            <div className="rounded-lg bg-blue-50 p-3 text-xs leading-relaxed text-blue-800 ring-1 ring-inset ring-blue-200">
              {summary.externalEmails
                ? `${summary.externalEmails} address(es) have no account — they can be emailed, but get no in-app notification. `
                : ""}
              {summary.unmatched
                ? `${summary.unmatched} number(s) match no account and cannot be reached.`
                : ""}
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 ring-1 ring-inset ring-red-200">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          Could not work out the audience size. The send will still count it
          again before it goes out.
        </div>
      ) : null}

      {summary.truncated ? (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 ring-1 ring-inset ring-red-200">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          {summary.count.toLocaleString("en-IN")} recipients is over the{" "}
          {summary.cap?.toLocaleString("en-IN")} limit for one send. Narrow the
          filter or split it into batches.
        </div>
      ) : null}
    </div>
  );
};

export default AudienceBuilder;
