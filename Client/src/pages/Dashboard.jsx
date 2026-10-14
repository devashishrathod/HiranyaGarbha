import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { keepPreviousData } from "@tanstack/react-query";
import {
  CalendarDays,
  CircleCheckBig,
  IndianRupee,
  Plus,
  RefreshCw,
  Send,
  UserPlus,
  Users,
} from "lucide-react";

import { getApiErrorMessage, useGetQuery } from "../api/apiCall";
import API_ENDPOINTS from "../api/apiEndpoint";
import BookAppointmentModal from "../components/appointments/BookAppointmentModal";
import { Button } from "../components/UI/kit";
import {
  LastCampaignCard,
  RecentActivityCard,
  RecentPaymentsCard,
  TodayAppointmentsCard,
  TopDoctorsCard,
} from "../components/dashboard/ActivityPanels";
import {
  AppointmentsChart,
  AppointmentsLegend,
  RevenueChart,
} from "../components/dashboard/Charts";
import DashboardCard from "../components/dashboard/DashboardCard";
import {
  clinicHour,
  formatCompactINR,
  formatINR,
  formatNumber,
  longToday,
  timeAgo,
} from "../components/dashboard/format";
import {
  ConsultationMixCard,
  NeedsAttentionCard,
  PatientJourneyCard,
  PlanMixCard,
  PregnancyStageCard,
} from "../components/dashboard/InsightPanels";
import KpiTile, { ChangeChip } from "../components/dashboard/KpiTile";
import RangePicker from "../components/dashboard/RangePicker";
import { COMPARE_LABELS, DASHBOARD_RANGES } from "../constants/dashboard";
import useAuth from "../hooks/useAuth";
import { buildQuery } from "../utils/ids";

// Background refresh while the tab is open; the range picker refetches at once.
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

const updatedAtLabel = (timestamp) => (timestamp ? ` · updated ${timeAgo(timestamp)}` : "");

const greeting = () => {
  const hour = clinicHour();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export function AdminDashboard() {
  const { user } = useAuth();
  const [query, setQuery] = useState({ range: DASHBOARD_RANGES.MONTH });
  const [bookOpen, setBookOpen] = useState(false);

  const endpoint = useMemo(
    () => `${API_ENDPOINTS.DASHBOARD.SUMMARY}${buildQuery(query)}`,
    [query],
  );

  const {
    data,
    isPending,
    isError,
    error,
    isFetching,
    isPlaceholderData,
    refetch,
    dataUpdatedAt,
  } = useGetQuery(endpoint, ["dashboard-summary", query], {
      // Keep the last window on screen while the next one loads, instead of
      // flashing the skeleton on every range change.
      placeholderData: keepPreviousData,
      refetchInterval: REFRESH_INTERVAL_MS,
    });

  const summary = data?.data;
  const firstName = user?.name?.trim().split(" ")[0] || "Admin";

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500">{longToday()}</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              {greeting()}, {firstName}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={() => refetch()}
              loading={isFetching}
              className="min-h-[44px]"
              aria-label="Refresh dashboard"
            >
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Link
              to="/notifications"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
            >
              <Send size={16} aria-hidden="true" />
              Send notification
            </Link>
            <Button icon={Plus} onClick={() => setBookOpen(true)} className="min-h-[44px]">
              Book appointment
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <p className="text-sm text-gray-500 lg:pt-3">
            Patients, plans and consultations
            {summary ? (
              <>
                {" for "}
                <span className="font-semibold text-gray-800">{summary.range.label}</span>
              </>
            ) : null}
            {updatedAtLabel(dataUpdatedAt)}
          </p>
          <RangePicker value={query} onChange={setQuery} />
        </div>
      </div>

      {isPending ? (
        <DashboardSkeleton />
      ) : isError && !summary ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200/80 bg-white px-6 py-14 text-center shadow-sm">
          <p className="text-base font-semibold text-gray-900">The dashboard could not load</p>
          <p className="max-w-md text-sm text-gray-500">
            {getApiErrorMessage(error, "Please try again in a moment.")}
          </p>
          <Button icon={RefreshCw} onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        // While the newly picked range loads, the previous one stays on screen
        // dimmed, so its numbers are never mistaken for the new range's.
        <div
          aria-busy={isPlaceholderData}
          className={`space-y-6 transition-opacity ${isPlaceholderData ? "pointer-events-none opacity-50" : ""}`}
        >
          <DashboardBody summary={summary} onBook={() => setBookOpen(true)} />
        </div>
      )}

      {bookOpen ? (
        <BookAppointmentModal onClose={() => setBookOpen(false)} onBooked={() => refetch()} />
      ) : null}
    </div>
  );
}

const DashboardBody = ({ summary, onBook }) => {
  const { kpis, range } = summary;
  const compare = COMPARE_LABELS[range.key] || COMPARE_LABELS[DASHBOARD_RANGES.CUSTOM];

  return (
    <>
      <section
        aria-label="Key metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      >
        <KpiTile
          label="Revenue"
          value={formatCompactINR(kpis.revenue.value)}
          icon={IndianRupee}
          change={kpis.revenue.change}
          hint={`${formatNumber(kpis.revenue.payments)} payments${
            kpis.revenue.change === null ? "" : ` · ${compare}`
          }`}
        />
        <KpiTile
          label="Active subscribers"
          value={formatNumber(kpis.subscribers.value)}
          icon={Users}
          // Joined in this window — a count, not a percent, and only shown when there were any.
          change={kpis.subscribers.activatedInRange || null}
          changeText={`+${formatNumber(kpis.subscribers.activatedInRange)} new`}
          hint={`${formatNumber(kpis.subscribers.paid)} on paid plans`}
        />
        <KpiTile
          label="New patients"
          value={formatNumber(kpis.newPatients.value)}
          icon={UserPlus}
          change={kpis.newPatients.change}
          hint={kpis.newPatients.change === null ? "Nothing to compare with" : compare}
        />
        <KpiTile
          label="Appointments"
          value={formatNumber(kpis.appointments.value)}
          icon={CalendarDays}
          change={kpis.appointments.change}
          hint={`${formatNumber(kpis.appointments.today)} scheduled today`}
        />
        <KpiTile
          label="Attendance rate"
          value={kpis.attendance.value === null ? "—" : `${kpis.attendance.value}%`}
          icon={CircleCheckBig}
          change={kpis.attendance.change}
          changeSuffix=" pts"
          hint={`${formatNumber(kpis.attendance.completed)} completed`}
        />
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <DashboardCard
          className="xl:col-span-2"
          title="Revenue"
          description={`Captured Razorpay payments · ${range.label}`}
          action={
            <div className="sm:text-right">
              <p className="text-xl font-bold text-gray-900">{formatINR(kpis.revenue.value)}</p>
              <div className="mt-1 flex items-center gap-2 sm:justify-end">
                <ChangeChip value={kpis.revenue.change} />
                <span className="text-xs text-gray-500">
                  {kpis.revenue.change === null ? "Nothing to compare with" : compare}
                </span>
              </div>
            </div>
          }
        >
          <RevenueChart data={summary.revenue} />
        </DashboardCard>
        <PlanMixCard plans={summary.plans} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <DashboardCard
          className="xl:col-span-2"
          title="Appointments"
          description={`What happened to every booked consultation · ${range.label}`}
          action={<AppointmentsLegend />}
        >
          <AppointmentsChart data={summary.appointments.series} />
        </DashboardCard>
        <ConsultationMixCard appointments={summary.appointments} attendance={kpis.attendance} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <PatientJourneyCard journey={summary.journey} />
        <PregnancyStageCard pregnancy={summary.pregnancy} />
        <div className="flex lg:col-span-2 xl:col-span-1">
          <TopDoctorsCard
            doctors={summary.topDoctors}
            rangeLabel={range.label}
            className="flex-1"
          />
        </div>
      </div>

      {/* Operations: what is happening today, next to what needs acting on */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="flex min-w-0 flex-col xl:col-span-2">
          <TodayAppointmentsCard today={summary.today} onBook={onBook} className="flex-1" />
        </div>
        <div className="grid grid-cols-1 content-start gap-4 lg:grid-cols-2 xl:grid-cols-1">
          <NeedsAttentionCard attention={summary.attention} />
          <LastCampaignCard campaign={summary.lastCampaign} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="flex min-w-0 flex-col xl:col-span-2">
          <RecentPaymentsCard payments={summary.payments} className="flex-1" />
        </div>
        <RecentActivityCard activity={summary.activity} />
      </div>
    </>
  );
};

const DashboardSkeleton = () => (
  <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Loading dashboard">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-[138px] rounded-2xl border border-gray-200/80 bg-white p-5">
          <div className="h-3 w-24 rounded bg-gray-200" />
          <div className="mt-5 h-7 w-28 rounded bg-gray-200" />
          <div className="mt-4 h-3 w-36 rounded bg-gray-100" />
        </div>
      ))}
    </div>
    {[0, 1].map((row) => (
      <div key={row} className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="h-[340px] rounded-2xl border border-gray-200/80 bg-white xl:col-span-2" />
        <div className="h-[340px] rounded-2xl border border-gray-200/80 bg-white" />
      </div>
    ))}
  </div>
);
