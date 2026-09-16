import { useMemo } from "react";
import {
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  UserX,
} from "lucide-react";

import { useGetQuery } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import { buildQuery } from "../../utils/ids";
import { STATUS_META } from "../../constants/appointment";
import {
  BarBreakdown,
  EmptyState,
  InlineLoader,
  MeterBar,
  SectionCard,
  StatCard,
} from "../UI/kit";

const STATUS_ORDER = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "IN_PROGRESS",
  "COMPLETED",
  "RESCHEDULED",
  "CANCELLED",
  "NO_SHOW",
];

/**
 * Engagement figures are derived from real appointment records rather than
 * stored separately, so they can never drift from what the lists show.
 */
const EngagementPanel = ({ patientId, doctorId, subject = "patient" }) => {
  const endpoint = useMemo(() => {
    if (!patientId && !doctorId) return null;
    return `${API_ENDPOINTS.APPOINTMENTS.STATS}${buildQuery({
      patientId,
      doctorId,
    })}`;
  }, [patientId, doctorId]);

  const { data, isLoading, error } = useGetQuery(endpoint, [
    "appointment-stats",
    patientId || doctorId,
  ]);

  const stats = data?.data;

  if (isLoading) return <InlineLoader label="Crunching engagement..." />;

  if (error) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Could not load engagement"
        message={error?.response?.data?.message}
      />
    );
  }

  if (!stats || !stats.total) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No appointment history yet"
        message={`Engagement is calculated from this ${subject}'s appointments. Book one to start tracking.`}
      />
    );
  }

  const breakdown = STATUS_ORDER.map((status) => ({
    label: STATUS_META[status]?.label || status,
    value: stats.byStatus?.[status] || 0,
  })).filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total appointments"
          value={stats.total}
          icon={CalendarDays}
          tone="blue"
        />
        <StatCard
          label="Upcoming"
          value={stats.upcoming}
          hint={stats.inProgress ? `${stats.inProgress} in progress` : undefined}
          icon={CalendarClock}
          tone="amber"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={CalendarCheck2}
          tone="green"
        />
        <StatCard
          label="Missed"
          value={stats.noShow + stats.cancelled}
          hint={`${stats.noShow} no-show · ${stats.cancelled} cancelled`}
          icon={UserX}
          tone="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <SectionCard
          title="Attendance rate"
          description="Completed visits as a share of everything that was settled"
          className="lg:col-span-2"
        >
          <p className="text-4xl font-bold tabular-nums text-gray-900">
            {stats.attendanceRate}%
          </p>
          <MeterBar
            value={stats.attendanceRate}
            className="mt-4"
            label={`Attendance rate ${stats.attendanceRate} percent`}
          />
          <p className="mt-3 text-xs text-gray-500">
            {stats.completed} completed of {stats.completed + stats.noShow + stats.cancelled}{" "}
            settled appointments
          </p>
        </SectionCard>

        <SectionCard
          title="Status breakdown"
          description="Every appointment on record, by current status"
          className="lg:col-span-3"
        >
          <BarBreakdown items={breakdown} />
        </SectionCard>
      </div>
    </div>
  );
};

export default EngagementPanel;
