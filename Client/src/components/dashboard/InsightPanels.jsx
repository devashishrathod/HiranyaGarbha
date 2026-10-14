import { Link } from "react-router-dom";
import {
  CalendarClock,
  CalendarX2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Mail,
  Stethoscope,
  XCircle,
} from "lucide-react";

import { APPOINTMENT_TYPES } from "../../constants/appointment";
import { CHART_COLORS, JOURNEY_LABELS, TIER_CHART } from "../../constants/dashboard";
import DashboardCard from "./DashboardCard";
import { PlanDonut } from "./Charts";
import { formatNumber, percentOf } from "./format";

const TYPE_LABELS = Object.fromEntries(
  APPOINTMENT_TYPES.map(({ value, label }) => [value, label]),
);

const GradientBar = ({ percent, className = "h-2" }) => (
  <div className={`w-full overflow-hidden rounded-full bg-gray-100 ${className}`}>
    <div
      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-[width] duration-500"
      style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
    />
  </div>
);

const MiniStat = ({ value, label }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3">
    <p className="text-lg font-bold text-gray-900">{formatNumber(value)}</p>
    <p className="text-xs text-gray-500">{label}</p>
  </div>
);

/* ------------------------------------------------------------------ */
/* Active plans                                                        */
/* ------------------------------------------------------------------ */

export const PlanMixCard = ({ plans }) => {
  const counts = Object.fromEntries((plans?.tiers || []).map((t) => [t.tier, t.count]));
  const total = plans?.total || 0;
  const slices = TIER_CHART.map((tier) => ({ ...tier, count: counts[tier.tier] || 0 }));

  return (
    <DashboardCard
      title="Active plans"
      description="Patients by the package they are on today"
      action={
        <Link to="/patient-plans" className="text-sm font-medium text-blue-600 hover:text-purple-600">
          View all
        </Link>
      }
      bodyClassName="px-5 pb-5 flex flex-col gap-5"
    >
      <div className="flex flex-wrap items-center justify-center gap-6">
        <PlanDonut slices={slices} total={total} />
        <ul className="min-w-[170px] flex-1 space-y-3">
          {slices.map((slice) => (
            <li key={slice.tier} className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: slice.color }} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-gray-900">{slice.label}</span>
                <span className="block text-xs text-gray-500">{slice.note}</span>
              </span>
              <span className="text-right tabular-nums">
                <span className="block text-sm font-semibold text-gray-900">
                  {formatNumber(slice.count)}
                </span>
                <span className="block text-xs text-gray-500">{percentOf(slice.count, total)}%</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-3">
        <MiniStat value={plans?.paid || 0} label="on paid plans" />
        <MiniStat value={plans?.bonus || 0} label="bonus courses active" />
      </div>
    </DashboardCard>
  );
};

/* ------------------------------------------------------------------ */
/* Consultation mix + attendance                                       */
/* ------------------------------------------------------------------ */

export const ConsultationMixCard = ({ appointments, attendance }) => {
  const types = appointments?.types || [];
  const total = types.reduce((sum, type) => sum + type.count, 0);
  const max = types.reduce((peak, type) => Math.max(peak, type.count), 0);
  const settled = (attendance?.completed || 0) + (attendance?.missed || 0);

  return (
    <DashboardCard
      title="Consultation mix"
      description="Appointments in this period by type"
      bodyClassName="px-5 pb-5 flex flex-col gap-5"
    >
      {types.length ? (
        <ul className="space-y-3.5">
          {types.map((type) => (
            <li key={type.type}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium text-gray-800">
                  {TYPE_LABELS[type.type] || type.type}
                </span>
                <span className="tabular-nums text-gray-500">
                  <span className="font-semibold text-gray-900">{formatNumber(type.count)}</span>
                  {" · "}
                  {percentOf(type.count, total)}%
                </span>
              </div>
              <GradientBar percent={percentOf(type.count, max)} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-6 text-center text-sm text-gray-500">No appointments in this period.</p>
      )}

      <div className="mt-auto border-t border-gray-100 pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium text-gray-600">Attendance rate</span>
          <span className="text-2xl font-bold text-gray-900">
            {attendance?.value === null || attendance?.value === undefined
              ? "—"
              : `${attendance.value}%`}
          </span>
        </div>
        <div
          className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100"
          role="img"
          aria-label={`${attendance?.completed || 0} completed, ${attendance?.missed || 0} cancelled or no-show`}
        >
          {settled ? (
            <>
              <div
                style={{
                  width: `${percentOf(attendance.completed, settled)}%`,
                  background: CHART_COLORS.completed,
                }}
              />
              <div
                className="border-l-2 border-white"
                style={{
                  width: `${100 - percentOf(attendance.completed, settled)}%`,
                  background: CHART_COLORS.missed,
                }}
              />
            </>
          ) : null}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {settled
            ? `${formatNumber(attendance.completed)} completed, ${formatNumber(attendance.missed)} cancelled or no-show.`
            : "No appointment has been completed or missed in this period yet."}
        </p>
      </div>
    </DashboardCard>
  );
};

/* ------------------------------------------------------------------ */
/* Patient journey                                                     */
/* ------------------------------------------------------------------ */

export const PatientJourneyCard = ({ journey = [] }) => {
  const first = journey[0]?.count || 0;

  return (
    <DashboardCard
      title="Patient journey"
      description="From sign-up to a paid plan, all time"
      action={
        <Link to="/patients" className="text-sm font-medium text-blue-600 hover:text-purple-600">
          Patients
        </Link>
      }
    >
      <ol className="space-y-4">
        {journey.map((step, index) => {
          const before = journey[index - 1]?.count;
          return (
            <li key={step.key}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium text-gray-800">{JOURNEY_LABELS[step.key] || step.key}</span>
                <span className="font-semibold tabular-nums text-gray-900">
                  {formatNumber(step.count)}
                </span>
              </div>
              <GradientBar percent={percentOf(step.count, first)} className="h-3" />
              <p className="mt-1 text-xs text-gray-500">
                {index === 0
                  ? "Every patient account"
                  : `${percentOf(step.count, before)}% of the step before`}
              </p>
            </li>
          );
        })}
      </ol>
    </DashboardCard>
  );
};

/* ------------------------------------------------------------------ */
/* Pregnancy stage                                                     */
/* ------------------------------------------------------------------ */

const TRIMESTER_ROWS = [
  { key: "first", label: "1st trimester", weeks: "weeks 1–13" },
  { key: "second", label: "2nd trimester", weeks: "weeks 14–27" },
  { key: "third", label: "3rd trimester", weeks: "weeks 28–40" },
];

export const PregnancyStageCard = ({ pregnancy }) => {
  const stages = pregnancy || {};
  const max = Math.max(0, ...TRIMESTER_ROWS.map((row) => stages[row.key] || 0));
  const notes = [
    stages.unknown ? `${formatNumber(stages.unknown)} without a due date` : null,
    stages.delivered ? `${formatNumber(stages.delivered)} past their due date` : null,
  ].filter(Boolean);

  return (
    <DashboardCard
      title="Pregnancy stage"
      description="Patients with a completed profile, worked out from their due date"
      bodyClassName="px-5 pb-5 flex flex-col gap-5"
    >
      <ul className="space-y-4">
        {TRIMESTER_ROWS.map((row) => (
          <li key={row.key}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium text-gray-800">
                {row.label} <span className="font-normal text-gray-500">· {row.weeks}</span>
              </span>
              <span className="tabular-nums text-gray-500">
                <span className="font-semibold text-gray-900">{formatNumber(stages[row.key])}</span>
                {" · "}
                {percentOf(stages[row.key] || 0, stages.total || 0)}%
              </span>
            </div>
            <GradientBar percent={percentOf(stages[row.key] || 0, max)} className="h-2.5" />
          </li>
        ))}
      </ul>
      <div className="mt-auto space-y-2">
        <div className="grid grid-cols-2 gap-3">
          <MiniStat value={stages.dueSoon || 0} label="due in the next 30 days" />
          <MiniStat value={stages.withCondition || 0} label="with a medical condition" />
        </div>
        {notes.length ? <p className="text-xs text-gray-500">{notes.join(" · ")}</p> : null}
      </div>
    </DashboardCard>
  );
};

/* ------------------------------------------------------------------ */
/* Needs attention                                                     */
/* ------------------------------------------------------------------ */

const SEVERITY = {
  critical: { chip: "bg-red-50 text-red-700 ring-red-200", icon: "bg-red-50 text-red-600", label: "Urgent" },
  warning: { chip: "bg-amber-50 text-amber-800 ring-amber-200", icon: "bg-amber-50 text-amber-600", label: "Follow up" },
  info: { chip: "bg-blue-50 text-blue-700 ring-blue-200", icon: "bg-blue-50 text-blue-600", label: "New" },
};

const plural = (count, one, many) => `${formatNumber(count)} ${count === 1 ? one : many}`;

const attentionItems = (attention = {}) =>
  [
    {
      key: "failedPayments",
      severity: "critical",
      icon: XCircle,
      title: plural(attention.failedPayments, "payment failed", "payments failed"),
      hint: "In the last 24 hours",
    },
    {
      key: "unclosedAppointments",
      severity: "warning",
      icon: CalendarX2,
      title: plural(
        attention.unclosedAppointments,
        "past appointment still open",
        "past appointments still open",
      ),
      hint: "Mark them completed, cancelled or no-show",
      to: "/appointments",
    },
    {
      key: "doctorsWithoutSchedule",
      severity: "warning",
      icon: Stethoscope,
      title: plural(attention.doctorsWithoutSchedule, "doctor has no schedule", "doctors have no schedule"),
      hint: "Patients cannot book them until availability is set",
      to: "/doctors",
    },
    {
      key: "expiringPlans",
      severity: "warning",
      icon: CalendarClock,
      title: plural(attention.expiringPlans, "plan ends this week", "plans end this week"),
      hint: "A good moment for a renewal reminder",
      to: "/notifications",
    },
    {
      key: "abandonedCheckouts",
      severity: "warning",
      icon: Clock,
      title: plural(attention.abandonedCheckouts, "checkout left unpaid", "checkouts left unpaid"),
      hint: "Started in the last 7 days, never paid",
    },
    {
      key: "newEnquiries",
      severity: "info",
      icon: Mail,
      title: plural(attention.newEnquiries, "new contact enquiry", "new contact enquiries"),
      hint: "Received today",
      to: "/contact-inquiries",
    },
  ].filter((item) => attention[item.key] > 0);

const AttentionRow = ({ item }) => {
  const severity = SEVERITY[item.severity];
  const Icon = item.icon;

  const body = (
    <>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${severity.icon}`}>
        <Icon size={18} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-gray-900">{item.title}</span>
        <span className="block text-xs text-gray-500">{item.hint}</span>
      </span>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${severity.chip}`}>
        {severity.label}
      </span>
      {item.to ? <ChevronRight size={16} className="shrink-0 text-gray-400" aria-hidden="true" /> : null}
    </>
  );

  return item.to ? (
    <Link
      to={item.to}
      className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 transition-colors hover:border-gray-200 hover:bg-gray-50"
    >
      {body}
    </Link>
  ) : (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">{body}</div>
  );
};

export const NeedsAttentionCard = ({ attention }) => {
  const items = attentionItems(attention);

  return (
    <DashboardCard title="Needs attention" description="What to act on today">
      {items.length ? (
        <div className="space-y-2.5">
          {items.map((item) => (
            <AttentionRow key={item.key} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={24} aria-hidden="true" />
          </span>
          <p className="text-sm font-semibold text-gray-900">All clear</p>
          <p className="text-xs text-gray-500">Nothing needs a follow-up right now.</p>
        </div>
      )}
    </DashboardCard>
  );
};
