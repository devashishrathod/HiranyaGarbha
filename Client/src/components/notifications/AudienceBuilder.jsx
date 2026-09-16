import { useEffect, useMemo } from "react";
import { AlertTriangle, ClipboardList, Filter, ListChecks, Users } from "lucide-react";

import { useGetQuery } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import { buildQuery } from "../../utils/ids";
import {
  AUDIENCE_GROUPS,
  AUDIENCE_MODES,
  AUDIENCE_MODE_META,
  DEFAULT_SEGMENT,
  LISTABLE_GROUPS,
  SEGMENT_STATUS_OPTIONS,
  getAudienceGroup,
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

const GROUP_ENDPOINTS = {
  PATIENTS: API_ENDPOINTS.PATIENTS.GET_ALL,
  DOCTORS: API_ENDPOINTS.DOCTORS.GET_ALL,
};

/** `limit=1` is the cheapest way to read a list endpoint's `total` */
const countEndpoint = (group, params = {}) =>
  `${GROUP_ENDPOINTS[group]}${buildQuery({ page: 1, limit: 1, ...params })}`;

const AudienceBuilder = ({ value, onChange, onResolve }) => {
  const patch = (changes) => onChange({ ...value, ...changes });

  /* Live totals for the two lists that already have an endpoint */
  const { data: patientCountData, isLoading: loadingPatients } = useGetQuery(
    countEndpoint("PATIENTS"),
    ["notification-count", "PATIENTS"],
  );
  const { data: doctorCountData, isLoading: loadingDoctors } = useGetQuery(
    countEndpoint("DOCTORS"),
    ["notification-count", "DOCTORS"],
  );

  const patientTotal = patientCountData?.data?.total || 0;
  const doctorTotal = doctorCountData?.data?.total || 0;

  /* Segment mode asks the same endpoint with the filters applied */
  const segmentEndpoint = useMemo(() => {
    if (value.mode !== AUDIENCE_MODES.SEGMENT) return null;

    return countEndpoint(value.segmentGroup, {
      search: value.segment.search || undefined,
      isActive: value.segment.status || undefined,
      fromDate: value.segment.fromDate || undefined,
      toDate: value.segment.toDate || undefined,
    });
  }, [value.mode, value.segmentGroup, value.segment]);

  const { data: segmentData, isFetching: segmentLoading } = useGetQuery(
    segmentEndpoint,
    ["notification-segment", value.segmentGroup, value.segment],
  );

  const segmentTotal = segmentData?.data?.total || 0;

  const csvParsed = useMemo(() => parseRecipientList(value.csv), [value.csv]);

  /* ---------------------------------------------------------------- */
  /* Resolve the audience into a label + headcount                     */
  /* ---------------------------------------------------------------- */

  const resolved = useMemo(() => {
    const totals = { PATIENTS: patientTotal, DOCTORS: doctorTotal };

    if (value.mode === AUDIENCE_MODES.ROLE) {
      const picked = value.groups.map(getAudienceGroup);
      const hasUncounted = picked.some((group) => !group.listable);
      const count = picked.reduce(
        (total, group) => total + (totals[group.key] || 0),
        0,
      );

      return {
        mode: value.mode,
        label: picked.length
          ? picked.map((group) => `All ${group.label.toLowerCase()}`).join(", ")
          : "No one selected",
        count,
        // Staff and admins have no list endpoint, so the total is a floor
        exact: !hasUncounted,
      };
    }

    if (value.mode === AUDIENCE_MODES.SEGMENT) {
      const group = getAudienceGroup(value.segmentGroup);
      const statusLabel =
        value.segment.status === "true"
          ? "Active"
          : value.segment.status === "false"
            ? "Inactive"
            : "All";

      const parts = [`${statusLabel} ${group.label.toLowerCase()}`];
      if (value.segment.search) parts.push(`matching "${value.segment.search}"`);
      if (value.segment.fromDate || value.segment.toDate) {
        parts.push(
          `joined ${value.segment.fromDate || "any time"} – ${
            value.segment.toDate || "today"
          }`,
        );
      }

      return {
        mode: value.mode,
        label: parts.join(", "),
        count: segmentTotal,
        exact: true,
      };
    }

    if (value.mode === AUDIENCE_MODES.MANUAL) {
      return {
        mode: value.mode,
        label: value.selected.length
          ? `${value.selected.length} hand-picked ${
              value.selected.length === 1 ? "recipient" : "recipients"
            }`
          : "No one selected",
        count: value.selected.length,
        exact: true,
      };
    }

    return {
      mode: value.mode,
      label: csvParsed.total
        ? `${csvParsed.emails.length} pasted emails, ${csvParsed.phones.length} pasted numbers`
        : "Nothing pasted yet",
      count: csvParsed.total,
      exact: true,
    };
  }, [value, patientTotal, doctorTotal, segmentTotal, csvParsed]);

  // Deps stay primitive so the parent is only told when something really moved
  useEffect(() => {
    onResolve(resolved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved.mode, resolved.label, resolved.count, resolved.exact]);

  /* ---------------------------------------------------------------- */

  const toggleGroup = (key) => {
    patch({
      groups: value.groups.includes(key)
        ? value.groups.filter((item) => item !== key)
        : [...value.groups, key],
    });
  };

  const countsLoading = loadingPatients || loadingDoctors;

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
            const total =
              group.key === "PATIENTS"
                ? patientTotal
                : group.key === "DOCTORS"
                  ? doctorTotal
                  : 0;

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
                    {group.listable ? (
                      <Pill tone={group.tone}>
                        {countsLoading ? "…" : total}
                      </Pill>
                    ) : (
                      <Pill tone="slate">count pending</Pill>
                    )}
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
              {segmentLoading ? "…" : segmentTotal}
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
            placeholder={"9876543210, 9812345678\nasha@example.com\n+91 98765 43210"}
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
        </div>
      ) : null}
    </div>
  );
};

export default AudienceBuilder;
