import { useMemo, useState } from "react";
import {
  Activity,
  Calendar,
  ClipboardList,
  MessageSquareText,
  Sparkles,
  Users,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import { buildMockDashboard } from "../components/dashboard/dashboardMock";
import { ActivityFeed } from "../components/dashboard/ActivityFeed";
import {
  AppointmentsTrendChart,
  SessionsStackChart,
} from "../components/dashboard/DashboardCharts";
import { KpiCard } from "../components/dashboard/KpiCard";
import { ModuleGrid } from "../components/dashboard/ModuleGrid";
import { Panel } from "../components/dashboard/Panel";
import { RangeFilter } from "../components/dashboard/RangeFilter";
import { QueueTable } from "../components/dashboard/QueueTable";
import {
  hasPermission,
  PERMISSIONS,
} from "../components/dashboard/permissions";
import { SectionHeader } from "../components/dashboard/ui";
import {
  DASHBOARD_LABELS,
  ROLES,
  TIME_PERIODS,
} from "../constants/appConstants";

export function AdminDashboard() {
  const { user } = useAuth();
  const [range, setRange] = useState(TIME_PERIODS.WEEKLY);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  const dashboard = useMemo(
    () =>
      buildMockDashboard({
        range,
        ...(range === TIME_PERIODS.CUSTOM
          ? dateRange
          : { startDate: "", endDate: "" }),
      }),
    [range, dateRange],
  );

  const canSeeUsers = hasPermission(user, PERMISSIONS.USERS_VIEW);
  const canSeeAppointments = hasPermission(user, PERMISSIONS.APPOINTMENTS_VIEW);
  const canSeeSessions = hasPermission(user, PERMISSIONS.SESSIONS_VIEW);
  const canSeeContent = hasPermission(user, PERMISSIONS.CONTENT_VIEW);
  const canSeeEnquiries = hasPermission(user, PERMISSIONS.ENQUIRIES_VIEW);
  const canSeeAnalytics = hasPermission(user, PERMISSIONS.ANALYTICS_VIEW);
  const role = getRole(user);
  const canSeeOutlets = role === ROLES.ADMIN || role === ROLES.SUBADMIN;

  const modules = useMemo(() => {
    const all = dashboard.modules || [];
    if (getRole(user) === "admin") return all;

    return all.filter((m) => {
      if (m.id === "users") return canSeeUsers;
      if (m.id === "content") return canSeeContent;
      if (m.id === "enquiries") return canSeeEnquiries;
      return true;
    });
  }, [dashboard.modules, user, canSeeUsers, canSeeContent, canSeeEnquiries]);

  return (
    <div className="min-h-screen">
      <div className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-indigo-50/40 to-white p-4 sm:p-6">
        <SectionHeader
          title={DASHBOARD_LABELS.TITLE}
          subtitle={DASHBOARD_LABELS.SUBTITLE}
          right={
            <RangeFilter
              value={range}
              onChange={setRange}
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onDateChange={setDateRange}
            />
          }
        />

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-9">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                title={DASHBOARD_LABELS.KPI_CUSTOMERS}
                value={dashboard.metrics.users.current}
                subLabel={DASHBOARD_LABELS.LABEL_NEW}
                subValue={dashboard.metrics.registrations.current}
                trendPct={dashboard.metrics.users.trendPct}
                icon={<Users className="h-5 w-5" />}
                tone="indigo"
              />
              <KpiCard
                title={DASHBOARD_LABELS.KPI_APPOINTMENTS}
                value={dashboard.metrics.appointments.current}
                subLabel={DASHBOARD_LABELS.LABEL_PREV}
                subValue={dashboard.metrics.appointments.prev}
                trendPct={dashboard.metrics.appointments.trendPct}
                icon={<Calendar className="h-5 w-5" />}
                tone="emerald"
              />
              <KpiCard
                title={DASHBOARD_LABELS.KPI_SESSIONS}
                value={dashboard.metrics.sessions.current}
                subLabel={DASHBOARD_LABELS.LABEL_PREV}
                subValue={dashboard.metrics.sessions.prev}
                trendPct={dashboard.metrics.sessions.trendPct}
                icon={<Activity className="h-5 w-5" />}
                tone="violet"
              />
              <KpiCard
                title={DASHBOARD_LABELS.KPI_CONTENT_PUBLISHED}
                value={dashboard.metrics.contentPublished.current}
                subLabel={DASHBOARD_LABELS.LABEL_PREV}
                subValue={dashboard.metrics.contentPublished.prev}
                trendPct={dashboard.metrics.contentPublished.trendPct}
                icon={<Sparkles className="h-5 w-5" />}
                tone="rose"
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
              <Panel
                title={DASHBOARD_LABELS.PANEL_APPOINTMENTS_TREND}
                subtitle={DASHBOARD_LABELS.PANEL_APPOINTMENTS_TREND_SUBTITLE}
                right={
                  <span className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                    {range.toUpperCase()}
                  </span>
                }
              >
                {canSeeAnalytics && canSeeAppointments ? (
                  <AppointmentsTrendChart
                    data={dashboard.charts.appointments}
                  />
                ) : (
                  <LockedNotice />
                )}
              </Panel>

              <Panel
                title={DASHBOARD_LABELS.PANEL_SESSIONS_OVERVIEW}
                subtitle={DASHBOARD_LABELS.PANEL_SESSIONS_OVERVIEW_SUBTITLE}
                right={
                  <span className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                    {range.toUpperCase()}
                  </span>
                }
              >
                {canSeeAnalytics && canSeeSessions ? (
                  <SessionsStackChart data={dashboard.charts.sessions} />
                ) : (
                  <LockedNotice />
                )}
              </Panel>
            </div>

            <div className="mt-4">
              <Panel
                title={DASHBOARD_LABELS.MODULES_TITLE}
                subtitle={DASHBOARD_LABELS.MODULES_SUBTITLE}
                right={
                  <span className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                    {DASHBOARD_LABELS.LABEL_ROLE}: {role || "user"}
                  </span>
                }
              >
                <ModuleGrid modules={modules} />
              </Panel>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <Panel
              title={DASHBOARD_LABELS.RECENT_ACTIVITY_TITLE}
              subtitle={DASHBOARD_LABELS.RECENT_ACTIVITY_SUBTITLE}
              right={
                <span className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
                  {DASHBOARD_LABELS.BADGE_LIVE}
                </span>
              }
            >
              <ActivityFeed items={dashboard.activity} />
            </Panel>

            <Panel
              title={DASHBOARD_LABELS.ENQUIRIES_QUEUE_TITLE}
              subtitle={DASHBOARD_LABELS.ENQUIRIES_QUEUE_SUBTITLE}
              right={
                <span className="inline-flex items-center gap-2 rounded-xl bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-700 ring-1 ring-cyan-100">
                  {DASHBOARD_LABELS.BADGE_CRM}
                </span>
              }
            >
              {canSeeEnquiries ? (
                <QueueTable
                  columns={[
                    { key: "name", label: "Name" },
                    { key: "subject", label: "Subject" },
                    { key: "status", label: "Status", type: "status" },
                  ]}
                  rows={dashboard.queues.enquiries}
                />
              ) : (
                <LockedNotice />
              )}
            </Panel>

            <Panel
              title={DASHBOARD_LABELS.APPOINTMENTS_QUEUE_TITLE}
              subtitle={DASHBOARD_LABELS.APPOINTMENTS_QUEUE_SUBTITLE}
              right={
                <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  {DASHBOARD_LABELS.BADGE_OPS}
                </span>
              }
            >
              {canSeeAppointments ? (
                <QueueTable
                  columns={[
                    { key: "customer", label: "Customer" },
                    { key: "service", label: "Service" },
                    { key: "when", label: "When", mono: true },
                    { key: "status", label: "Status", type: "status" },
                  ]}
                  rows={dashboard.queues.appointments}
                />
              ) : (
                <LockedNotice />
              )}
            </Panel>
          </div>
        </div>

        {canSeeOutlets ? (
          <div className="mt-4">
            <Panel
              title={DASHBOARD_LABELS.OUTLET_REPORTS_TITLE}
              subtitle={DASHBOARD_LABELS.OUTLET_REPORTS_SUBTITLE}
              right={
                <span className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                  {role === ROLES.SUBADMIN
                    ? DASHBOARD_LABELS.LABEL_MY_OUTLET
                    : DASHBOARD_LABELS.LABEL_ALL_OUTLETS}
                </span>
              }
            >
              <QueueTable
                columns={[
                  { key: "name", label: "Outlet" },
                  { key: "city", label: "City" },
                  { key: "customers", label: "Customers" },
                  { key: "appointments", label: "Appointments" },
                  { key: "sessions", label: "Sessions" },
                  { key: "enquiries", label: "Enquiries" },
                  { key: "trendPct", label: "Trend" },
                ]}
                rows={dashboard.outlets || []}
              />
            </Panel>
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel
            title={DASHBOARD_LABELS.PANEL_GROWTH}
            subtitle={DASHBOARD_LABELS.PANEL_GROWTH_SUBTITLE}
          >
            <div className="grid grid-cols-2 gap-3">
              <StatRow
                label={DASHBOARD_LABELS.STAT_CUSTOMERS}
                value={dashboard.metrics.users.current}
                icon={<Users className="h-4 w-4" />}
              />
              <StatRow
                label={DASHBOARD_LABELS.STAT_APPOINTMENTS}
                value={dashboard.metrics.appointments.current}
                icon={<Calendar className="h-4 w-4" />}
              />
              <StatRow
                label={DASHBOARD_LABELS.STAT_SESSIONS}
                value={dashboard.metrics.sessions.current}
                icon={<Activity className="h-4 w-4" />}
              />
              <StatRow
                label={DASHBOARD_LABELS.STAT_ENQUIRIES}
                value={dashboard.metrics.enquiries.current}
                icon={<MessageSquareText className="h-4 w-4" />}
              />
            </div>
          </Panel>

          <Panel
            title={DASHBOARD_LABELS.PANEL_PUBLISHING}
            subtitle={DASHBOARD_LABELS.PANEL_PUBLISHING_SUBTITLE}
          >
            {canSeeContent ? (
              <div className="space-y-3">
                <PublishLine label={DASHBOARD_LABELS.PUBLISH_TIPS} value={8} />
                <PublishLine
                  label={DASHBOARD_LABELS.PUBLISH_TRIMESTER_PLANS}
                  value={4}
                />
                <PublishLine
                  label={DASHBOARD_LABELS.PUBLISH_NUTRITION_PLANS}
                  value={5}
                />
                <PublishLine
                  label={DASHBOARD_LABELS.PUBLISH_MEAL_PLANS}
                  value={4}
                />
              </div>
            ) : (
              <LockedNotice />
            )}
          </Panel>

          <Panel
            title={DASHBOARD_LABELS.PANEL_ACTIONS}
            subtitle={DASHBOARD_LABELS.PANEL_ACTIONS_SUBTITLE}
          >
            <div className="grid grid-cols-1 gap-2">
              <QuickAction
                title={DASHBOARD_LABELS.ACTION_CREATE_CUSTOMER}
                hint={DASHBOARD_LABELS.ACTION_CREATE_CUSTOMER_HINT}
                enabled={canSeeUsers}
              />
              <QuickAction
                title={DASHBOARD_LABELS.ACTION_ASSIGN_ENQUIRY}
                hint={DASHBOARD_LABELS.ACTION_ASSIGN_ENQUIRY_HINT}
                enabled={canSeeEnquiries}
              />
              <QuickAction
                title={DASHBOARD_LABELS.ACTION_PUBLISH_TIP}
                hint={DASHBOARD_LABELS.ACTION_PUBLISH_TIP_HINT}
                enabled={canSeeContent}
              />
              <QuickAction
                title={DASHBOARD_LABELS.ACTION_REVIEW_APPOINTMENTS}
                hint={DASHBOARD_LABELS.ACTION_REVIEW_APPOINTMENTS_HINT}
                enabled={canSeeAppointments}
              />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function getRole(user) {
  if (!user?.role || typeof user.role !== "string") return "";
  return user.role.toLowerCase();
}

function LockedNotice() {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
      <p className="text-sm font-semibold text-slate-800">Access restricted</p>
      <p className="mt-1 text-xs text-slate-600">
        Admin can define permissions for this role.
      </p>
    </div>
  );
}

function StatRow({ label, value, icon }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-600 truncate">{label}</p>
        <p className="text-sm font-semibold text-slate-900 truncate">{value}</p>
      </div>
    </div>
  );
}

function PublishLine({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-700 ring-1 ring-rose-100 flex items-center justify-center">
          <ClipboardList className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {label}
          </p>
          <p className="text-xs text-slate-600">Published this {""}period</p>
        </div>
      </div>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function QuickAction({ title, hint, enabled }) {
  return (
    <button
      type="button"
      disabled={!enabled}
      className={`w-full rounded-xl border px-4 py-3 text-left transition ${
        enabled
          ? "border-slate-200 bg-white hover:bg-slate-50"
          : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
      }`}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-0.5 text-xs">{hint}</p>
    </button>
  );
}
