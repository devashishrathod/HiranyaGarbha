import { Link } from "react-router-dom";
import {
  AlertCircle,
  CalendarPlus,
  CalendarX2,
  CreditCard,
  Gift,
  Mail,
  Plus,
  RotateCcw,
  Send,
  Star,
  UserPlus,
} from "lucide-react";

import { APPOINTMENT_TYPES, STATUS_META } from "../../constants/appointment";
import { CAMPAIGN_STATUS_META, PAYMENT_STATUS_META } from "../../constants/dashboard";
import { formatDateTime, formatTime, relativeDay } from "../../utils/datetime";
import { Avatar, Button, MeterBar, Pill } from "../UI/kit";
import DashboardCard from "./DashboardCard";
import { formatINR, formatNumber, percentOf, planLabel, timeAgo } from "./format";

const TYPE_LABELS = Object.fromEntries(
  APPOINTMENT_TYPES.map(({ value, label }) => [value, label]),
);

const ViewAll = ({ to, children = "View all" }) => (
  <Link to={to} className="text-sm font-medium text-blue-600 hover:text-purple-600">
    {children}
  </Link>
);

/** A person's name, linked to their detail page when we know who they are */
const PersonLink = ({ person, basePath, className = "" }) => {
  const name = person?.name?.trim() || "Unnamed";
  if (!person?.userId) return <span className={className}>{name}</span>;

  return (
    <Link to={`${basePath}/${person.userId}`} className={`hover:text-blue-600 ${className}`}>
      {name}
    </Link>
  );
};

const TH = "px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500";
const TD = "px-5 py-3 align-middle";

/* ------------------------------------------------------------------ */
/* Today's appointments                                                */
/* ------------------------------------------------------------------ */

export const TodayAppointmentsCard = ({ today, onBook, className = "" }) => {
  const items = today?.items || [];
  const total = today?.total || 0;

  return (
    <DashboardCard
      className={className}
      title="Today's appointments"
      description={
        total > items.length
          ? `Showing the first ${items.length} of ${formatNumber(total)} scheduled today`
          : `${formatNumber(total)} scheduled today`
      }
      action={<ViewAll to="/appointments" />}
      bodyClassName="pb-2"
    >
      {items.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-y border-gray-100 bg-gray-50/70">
              <tr>
                <th className={TH}>Time</th>
                <th className={TH}>Patient</th>
                <th className={TH}>Doctor</th>
                <th className={TH}>Type</th>
                <th className={TH}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => {
                const status = STATUS_META[item.status] || { label: item.status, tone: "slate" };
                return (
                  <tr key={item.id} className="hover:bg-gray-50/60">
                    <td className={`${TD} whitespace-nowrap font-semibold tabular-nums text-gray-900`}>
                      {formatTime(item.startTime)}
                    </td>
                    <td className={TD}>
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar src={item.patient?.image} name={item.patient?.name || ""} size="sm" />
                        <div className="min-w-0">
                          <PersonLink
                            person={item.patient}
                            basePath="/patients"
                            className="block truncate font-semibold text-gray-900"
                          />
                          {item.patient?.trimester ? (
                            <p className="truncate text-xs capitalize text-gray-500">
                              {item.patient.trimester}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className={`${TD} text-gray-700`}>
                      <PersonLink person={item.doctor} basePath="/doctors" className="block truncate" />
                      {item.doctor?.specialization ? (
                        <p className="truncate text-xs capitalize text-gray-500">
                          {item.doctor.specialization}
                        </p>
                      ) : null}
                    </td>
                    <td className={`${TD} whitespace-nowrap text-gray-700`}>
                      {TYPE_LABELS[item.type] || item.type}
                    </td>
                    <td className={`${TD} whitespace-nowrap`}>
                      <Pill tone={status.tone}>{status.label}</Pill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
          <p className="text-sm font-semibold text-gray-900">No appointments today</p>
          <p className="text-xs text-gray-500">Bookings made for today will show up here.</p>
          <Button icon={Plus} onClick={onBook}>
            Book appointment
          </Button>
        </div>
      )}
    </DashboardCard>
  );
};

/* ------------------------------------------------------------------ */
/* Recent activity                                                     */
/* ------------------------------------------------------------------ */

const name = (person) => person?.name?.trim() || "A patient";

const ACTIVITY = {
  PATIENT_REGISTERED: {
    icon: UserPlus,
    tone: "bg-blue-50 text-blue-600",
    title: "New patient registered",
    detail: (event) => name(event.patient),
  },
  PAYMENT_CAPTURED: {
    icon: CreditCard,
    tone: "bg-emerald-50 text-emerald-600",
    title: "Payment received",
    detail: (event) => `${name(event.patient)} · ${planLabel(event)} · ${formatINR(event.amount)}`,
  },
  PAYMENT_FAILED: {
    icon: AlertCircle,
    tone: "bg-red-50 text-red-600",
    title: "Payment failed",
    detail: (event) =>
      [name(event.patient), planLabel(event), event.method?.toUpperCase()].filter(Boolean).join(" · "),
  },
  PAYMENT_REFUNDED: {
    icon: RotateCcw,
    tone: "bg-gray-100 text-gray-600",
    title: "Payment refunded",
    detail: (event) => `${name(event.patient)} · ${formatINR(event.amount)}`,
  },
  APPOINTMENT_BOOKED: {
    icon: CalendarPlus,
    tone: "bg-purple-50 text-purple-600",
    title: "Appointment booked",
    detail: (event) =>
      `${name(event.patient)}${event.doctorName ? ` with ${event.doctorName}` : ""} · ${relativeDay(event.startTime)}, ${formatTime(event.startTime)}`,
  },
  APPOINTMENT_CANCELLED: {
    icon: CalendarX2,
    tone: "bg-red-50 text-red-600",
    title: "Appointment cancelled",
    detail: (event) =>
      `${name(event.patient)}${event.doctorName ? ` with ${event.doctorName}` : ""}${
        event.cancelledBy ? ` · by ${event.cancelledBy.toLowerCase()}` : ""
      }`,
  },
  FREE_PLAN_ACTIVATED: {
    icon: Gift,
    tone: "bg-purple-50 text-purple-600",
    title: "Free Basic activated",
    detail: (event) => `${name(event.patient)} completed the profile`,
  },
  CAMPAIGN_SENT: {
    icon: Send,
    tone: "bg-blue-50 text-blue-600",
    title: "Notification sent",
    detail: (event) => `“${event.title}” · ${formatNumber(event.delivered)} delivered`,
  },
  ENQUIRY_RECEIVED: {
    icon: Mail,
    tone: "bg-amber-50 text-amber-600",
    title: "Contact enquiry",
    detail: (event) => `${event.name || "Someone"}${event.city ? ` from ${event.city}` : ""}`,
  },
};

export const RecentActivityCard = ({ activity = [] }) => (
  <DashboardCard title="Recent activity" description="Across patients, payments and messages">
    {activity.length ? (
      <ol className="divide-y divide-gray-100">
        {activity.map((event) => {
          const config = ACTIVITY[event.type];
          if (!config) return null;
          const Icon = config.icon;

          return (
            <li key={event.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${config.tone}`}>
                <Icon size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900">{config.title}</p>
                  <time
                    dateTime={event.at}
                    title={formatDateTime(event.at)}
                    className="shrink-0 text-xs text-gray-500"
                  >
                    {timeAgo(event.at)}
                  </time>
                </div>
                <p className="truncate text-xs text-gray-600">{config.detail(event)}</p>
              </div>
            </li>
          );
        })}
      </ol>
    ) : (
      <p className="py-10 text-center text-sm text-gray-500">Nothing has happened yet.</p>
    )}
  </DashboardCard>
);

/* ------------------------------------------------------------------ */
/* Recent payments                                                     */
/* ------------------------------------------------------------------ */

export const RecentPaymentsCard = ({ payments = [], className = "" }) => (
  <DashboardCard
    className={className}
    title="Recent payments"
    description="Latest subscription checkouts through Razorpay"
    action={<ViewAll to="/patient-plans">All plans</ViewAll>}
    bodyClassName="pb-2"
  >
    {payments.length ? (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="border-y border-gray-100 bg-gray-50/70">
            <tr>
              <th className={TH}>Subscription</th>
              <th className={TH}>Patient &amp; plan</th>
              <th className={`${TH} text-right`}>Amount</th>
              <th className={TH}>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.map((payment) => {
              const status = PAYMENT_STATUS_META[payment.status] || {
                label: payment.status,
                tone: "slate",
              };
              return (
                <tr key={payment.id} className="hover:bg-gray-50/60">
                  <td className={TD}>
                    <p className="whitespace-nowrap font-semibold tabular-nums text-gray-900">
                      {payment.subscriptionNumber || "—"}
                    </p>
                    <p className="whitespace-nowrap text-xs text-gray-500">{formatDateTime(payment.at)}</p>
                  </td>
                  <td className={`${TD} max-w-0 w-full`}>
                    <PersonLink
                      person={payment.patient}
                      basePath="/patients"
                      className="block truncate font-semibold text-gray-900"
                    />
                    <p className="truncate text-xs text-gray-500" title={planLabel(payment)}>
                      {planLabel(payment)}
                    </p>
                  </td>
                  <td className={`${TD} whitespace-nowrap text-right`}>
                    <p className="font-semibold tabular-nums text-gray-900">{formatINR(payment.amount)}</p>
                    {payment.method ? (
                      <p className="text-xs uppercase text-gray-500">{payment.method}</p>
                    ) : null}
                  </td>
                  <td className={`${TD} whitespace-nowrap`}>
                    <span title={payment.failureReason || undefined}>
                      <Pill tone={status.tone}>{status.label}</Pill>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="px-5 py-10 text-center text-sm text-gray-500">No checkouts yet.</p>
    )}
  </DashboardCard>
);

/* ------------------------------------------------------------------ */
/* Top doctors                                                         */
/* ------------------------------------------------------------------ */

export const TopDoctorsCard = ({ doctors = [], rangeLabel, className = "" }) => (
  <DashboardCard
    className={className}
    title="Top doctors"
    description={`By completed consultations · ${rangeLabel}`}
    action={<ViewAll to="/doctors" />}
  >
    {doctors.length ? (
      <ul className="space-y-3.5">
        {doctors.map((doctor) => (
          <li key={doctor.doctorId} className="flex items-center gap-3">
            <Avatar src={doctor.image} name={doctor.name || ""} size="sm" />
            <div className="min-w-0 flex-1">
              <PersonLink
                person={doctor}
                basePath="/doctors"
                className="block truncate text-sm font-semibold text-gray-900"
              />
              <p className="flex items-center gap-1 truncate text-xs capitalize text-gray-500">
                {doctor.specialization || "Doctor"}
                {doctor.rating > 0 ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <Star size={11} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                    {doctor.rating.toFixed(1)}
                  </>
                ) : null}
              </p>
            </div>
            <div className="text-right tabular-nums">
              <p className="text-sm font-bold text-gray-900">{formatNumber(doctor.completed)}</p>
              <p className="text-xs text-gray-500">{percentOf(doctor.completed, doctor.settled)}% attended</p>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p className="py-8 text-center text-sm text-gray-500">
        No completed consultations in this period.
      </p>
    )}
  </DashboardCard>
);

/* ------------------------------------------------------------------ */
/* Last campaign                                                       */
/* ------------------------------------------------------------------ */

export const LastCampaignCard = ({ campaign }) => {
  if (!campaign) {
    return (
      <DashboardCard title="Last notification" action={<ViewAll to="/notifications">Send one</ViewAll>}>
        <p className="py-6 text-center text-sm text-gray-500">No notification has been sent yet.</p>
      </DashboardCard>
    );
  }

  const status = CAMPAIGN_STATUS_META[campaign.status] || { label: campaign.status, tone: "slate" };
  const readPercent = percentOf(campaign.read, campaign.inApp);

  return (
    <DashboardCard
      title="Last notification"
      description={formatDateTime(campaign.sentAt)}
      action={<Pill tone={status.tone}>{status.label}</Pill>}
      bodyClassName="px-5 pb-5 space-y-4"
    >
      <div>
        <p className="truncate text-sm font-semibold text-gray-900">“{campaign.title}”</p>
        {campaign.audienceLabel ? (
          <p className="truncate text-xs text-gray-500">{campaign.audienceLabel}</p>
        ) : null}
      </div>
      <dl className="grid grid-cols-3 gap-3">
        {[
          ["Targeted", campaign.targeted],
          ["Delivered", campaign.delivered],
          ["Failed", campaign.failed],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-gray-500">{label}</dt>
            <dd className="text-lg font-bold text-gray-900">{formatNumber(value)}</dd>
          </div>
        ))}
      </dl>
      {campaign.inApp ? (
        <div>
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="font-medium text-gray-600">Read in the app</span>
            <span className="font-semibold text-gray-900">
              {formatNumber(campaign.read)} of {formatNumber(campaign.inApp)} · {readPercent}%
            </span>
          </div>
          <MeterBar value={campaign.read} max={campaign.inApp} label={`${readPercent}% read in the app`} />
        </div>
      ) : null}
      <ViewAll to="/notifications">All notifications</ViewAll>
    </DashboardCard>
  );
};
