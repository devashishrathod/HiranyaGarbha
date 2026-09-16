import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  Plus,
  Search,
  SlidersHorizontal,
  UserX,
} from "lucide-react";

import { useGetQuery } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import AppointmentsPanel from "../../components/appointments/AppointmentsPanel";
import BookAppointmentModal from "../../components/appointments/BookAppointmentModal";
import EntityPicker from "../../components/appointments/EntityPicker";
import {
  Button,
  Input,
  PageHeader,
  SectionCard,
  Select,
  StatCard,
} from "../../components/UI/kit";
import { APPOINTMENT_TYPES } from "../../constants/appointment";
import { buildQuery } from "../../utils/ids";

const AppointmentPage = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [doctor, setDoctor] = useState(null);
  const [patient, setPatient] = useState(null);
  const [appointmentType, setAppointmentType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [bookOpen, setBookOpen] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const scope = useMemo(
    () => ({
      doctorId: doctor?._id || undefined,
      patientId: patient?._id || undefined,
      appointmentType: appointmentType || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    }),
    [doctor, patient, appointmentType, fromDate, toDate],
  );

  const statsEndpoint = useMemo(
    () => `${API_ENDPOINTS.APPOINTMENTS.STATS}${buildQuery(scope)}`,
    [scope],
  );

  const { data: statsData, refetch: refetchStats } = useGetQuery(statsEndpoint, [
    "appointment-stats-global",
    scope,
    version,
  ]);

  const stats = statsData?.data;

  const hasFilters =
    Boolean(doctor || patient || appointmentType || fromDate || toDate);

  const clearFilters = () => {
    setDoctor(null);
    setPatient(null);
    setAppointmentType("");
    setFromDate("");
    setToDate("");
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <PageHeader
        title="Appointments"
        subtitle="Every booking across doctors and patients, with the full status workflow."
        actions={
          <Button icon={Plus} onClick={() => setBookOpen(true)}>
            New appointment
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total"
          value={stats?.total ?? "—"}
          hint={hasFilters ? "Within current filters" : "All time"}
          icon={CalendarDays}
          tone="blue"
        />
        <StatCard
          label="Upcoming"
          value={stats?.upcoming ?? "—"}
          hint={
            stats?.inProgress ? `${stats.inProgress} in progress` : undefined
          }
          icon={CalendarClock}
          tone="amber"
        />
        <StatCard
          label="Completed"
          value={stats?.completed ?? "—"}
          hint={
            stats ? `${stats.attendanceRate}% attendance rate` : undefined
          }
          icon={CalendarCheck2}
          tone="green"
        />
        <StatCard
          label="Cancelled / no-show"
          value={
            stats ? stats.cancelled + stats.noShow : "—"
          }
          hint={
            stats
              ? `${stats.cancelled} cancelled · ${stats.noShow} no-show`
              : undefined
          }
          icon={UserX}
          tone="red"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by appointment number, patient or doctor..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Button
          variant="secondary"
          icon={SlidersHorizontal}
          onClick={() => setFiltersOpen((previous) => !previous)}
        >
          Filters
          {hasFilters ? (
            <span className="ml-1 h-2 w-2 rounded-full bg-blue-600" />
          ) : null}
        </Button>

        {hasFilters ? (
          <Button variant="ghost" onClick={clearFilters}>
            Clear
          </Button>
        ) : null}
      </div>

      {filtersOpen ? (
        <SectionCard title="Filters">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <EntityPicker
              label="Doctor"
              basePath={API_ENDPOINTS.DOCTORS.GET_ALL}
              value={doctor}
              onChange={setDoctor}
              subtitleKey="specialization"
              placeholder="Filter by doctor"
            />

            <EntityPicker
              label="Patient"
              basePath={API_ENDPOINTS.PATIENTS.GET_ALL}
              value={patient}
              onChange={setPatient}
              placeholder="Filter by patient"
            />

            <Select
              label="Appointment type"
              value={appointmentType}
              onChange={(event) => setAppointmentType(event.target.value)}
            >
              <option value="">Any type</option>
              {APPOINTMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>

            <Input
              label="From date"
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />

            <Input
              label="To date"
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </div>
        </SectionCard>
      ) : null}

      <AppointmentsPanel
        basePath={API_ENDPOINTS.APPOINTMENTS.GET_ALL}
        params={{ ...scope, search: search || undefined }}
        queryKey={["appointments-global", version]}
        title="All appointments"
        pageSize={15}
        onChanged={() => {
          setVersion((previous) => previous + 1);
          refetchStats();
        }}
      />

      {bookOpen ? (
        <BookAppointmentModal
          onClose={() => setBookOpen(false)}
          onBooked={() => {
            setVersion((previous) => previous + 1);
            refetchStats();
          }}
        />
      ) : null}
    </div>
  );
};

export { AppointmentPage };
export default AppointmentPage;
