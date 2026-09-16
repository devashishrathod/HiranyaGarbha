import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  CalendarCog,
  CalendarPlus,
  ClipboardList,
  IndianRupee,
  Mail,
  Pencil,
  Phone,
  Stethoscope,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { useApiMutation, useGetQuery } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import AppointmentsPanel from "../../components/appointments/AppointmentsPanel";
import BookAppointmentModal from "../../components/appointments/BookAppointmentModal";
import EngagementPanel from "../../components/appointments/EngagementPanel";
import {
  Avatar,
  Button,
  Chip,
  EmptyState,
  Field,
  InlineLoader,
  Pill,
  SectionCard,
  Tabs,
} from "../../components/UI/kit";
import { STATUS_META } from "../../constants/appointment";
import { buildQuery, nameOf, withPath } from "../../utils/ids";
import { formatDate, formatTimeRange } from "../../utils/datetime";
import AvailabilityEditor from "./AvailabilityEditor";
import DoctorFormModal from "./DoctorFormModal";

const TABS = [
  { key: "overview", label: "Profile", icon: UserRound },
  { key: "availability", label: "Availability", icon: CalendarCog },
  { key: "appointments", label: "Appointments", icon: ClipboardList },
  { key: "engagement", label: "Engagement", icon: Activity },
];

/** Doctor's day at a glance — the /today endpoint returns a plain array */
const TodaySchedule = ({ doctorId }) => {
  const endpoint = withPath(API_ENDPOINTS.APPOINTMENTS.DOCTOR_TODAY, {
    doctorId,
  });

  const { data, isLoading } = useGetQuery(endpoint, ["doctor-today", doctorId]);
  const appointments = data?.data || [];

  return (
    <SectionCard
      title="Today's schedule"
      description={
        isLoading
          ? undefined
          : `${appointments.length} appointment${appointments.length === 1 ? "" : "s"} today`
      }
    >
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : appointments.length === 0 ? (
        <p className="text-sm text-gray-400">Nothing booked for today.</p>
      ) : (
        <ul className="space-y-2">
          {appointments.map((appointment) => {
            const meta =
              STATUS_META[appointment.status] || STATUS_META.PENDING;

            return (
              <li
                key={appointment._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar
                    size="sm"
                    name={nameOf(appointment.patientId, "Patient")}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">
                      {nameOf(appointment.patientId, "Unknown patient")}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {appointment.patientId?.phone || appointment.appointmentNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-800">
                    {formatTimeRange(
                      appointment.startTime,
                      appointment.endTime,
                      appointment.timezone,
                    )}
                  </span>
                  <Pill tone={meta.tone}>{meta.label}</Pill>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
};

export const DoctorDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [tab, setTab] = useState("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [statsVersion, setStatsVersion] = useState(0);

  const endpoint = useMemo(
    () =>
      userId
        ? `${API_ENDPOINTS.DOCTORS.GET_PROFILE}${buildQuery({
            doctorId: userId,
          })}`
        : null,
    [userId],
  );

  const { data, isLoading, error, refetch } = useGetQuery(endpoint, [
    "doctor-profile",
    userId,
  ]);

  const { mutate: removeDoctor, isPending: isDeleting } = useApiMutation({
    method: "delete",
  });

  const doctor = data?.data;
  const account = doctor?.userId;

  const handleDelete = () => {
    if (
      !window.confirm(
        `Delete ${doctor?.fullName || "this doctor"}? Their profile and login will be deactivated.`,
      )
    ) {
      return;
    }

    removeDoctor(
      { url: withPath(API_ENDPOINTS.DOCTORS.DELETE, { id: doctor._id }) },
      {
        onSuccess: (res) => {
          toast.success(res?.message || "Doctor deleted");
          navigate("/doctors");
        },
      },
    );
  };

  if (isLoading) return <InlineLoader label="Loading doctor..." />;

  if (error || !doctor) {
    return (
      <div className="p-6">
        <Button
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => navigate("/doctors")}
        >
          Back to doctors
        </Button>
        <EmptyState
          icon={Stethoscope}
          title="Doctor profile not found"
          message={
            error?.response?.data?.message ||
            "This doctor may have been removed, or the profile was never completed."
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Button
        variant="ghost"
        icon={ArrowLeft}
        className="-ml-2"
        onClick={() => navigate("/doctors")}
      >
        Back to doctors
      </Button>

      {/* Hero */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
          <Avatar size="xl" src={doctor.image} name={doctor.fullName || "?"} />

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold">
              {doctor.fullName || "Unnamed doctor"}
            </h1>
            <p className="mt-1 text-white/85">
              {doctor.specialization || "Specialization not set"}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/85">
              {doctor.experience ? <span>{doctor.experience}</span> : null}
              {doctor.phone ? (
                <span className="inline-flex items-center gap-1.5">
                  <Phone size={14} /> {doctor.phone}
                </span>
              ) : null}
              {doctor.email ? (
                <span className="inline-flex items-center gap-1.5">
                  <Mail size={14} /> {doctor.email}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1">
                <IndianRupee size={14} />
                {doctor.consultationFee || 0} per consult
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                {doctor.isActive ? "Active" : "Inactive"}
              </span>
              {doctor.department ? (
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                  {doctor.department}
                </span>
              ) : null}
              {doctor.licenseNumber ? (
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                  License {doctor.licenseNumber}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              icon={CalendarPlus}
              onClick={() => setBookOpen(true)}
            >
              Book appointment
            </Button>
            <Button
              variant="secondary"
              icon={Pencil}
              onClick={() => setEditOpen(true)}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              icon={Trash2}
              loading={isDeleting}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "overview" ? (
        <div className="space-y-6">
          <SectionCard
            title="Personal details"
            action={
              <Button variant="soft" icon={Pencil} onClick={() => setEditOpen(true)}>
                Edit
              </Button>
            }
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Full name" value={doctor.fullName} />
              <Field
                label="Date of birth"
                value={doctor.dateOfBirth ? formatDate(doctor.dateOfBirth) : null}
              />
              <Field label="Gender" value={doctor.gender} />
              <Field label="Blood group" value={doctor.bloodGroup} />
              <Field label="Email" value={doctor.email} />
              <Field label="Phone" value={doctor.phone} />
              <Field
                label="Login mobile"
                value={account?.mobile ? String(account.mobile) : null}
              />
              <Field
                label="Address"
                value={doctor.address}
                className="sm:col-span-2"
              />
            </div>
          </SectionCard>

          <SectionCard title="Professional details">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Specialization" value={doctor.specialization} />
              <Field label="Qualifications" value={doctor.qualifications} />
              <Field label="Experience" value={doctor.experience} />
              <Field label="License number" value={doctor.licenseNumber} />
              <Field label="Department" value={doctor.department} />
              <Field
                label="Consultation fee"
                value={
                  doctor.consultationFee ? `₹${doctor.consultationFee}` : null
                }
              />
              <Field label="Available days" value={doctor.availableDays} />
              <Field label="Available time" value={doctor.availableTime} />
              <Field
                label="Profile status"
                value={
                  <Pill tone={doctor.isProfileCompleted ? "green" : "amber"}>
                    {doctor.isProfileCompleted ? "Completed" : "Incomplete"}
                  </Pill>
                }
              />
            </div>

            <p className="mt-5 rounded-lg bg-blue-50 px-4 py-3 text-xs text-blue-800">
              Available days and time above are display text. Bookable slots come
              from the <strong>Availability</strong> tab.
            </p>
          </SectionCard>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SectionCard title="Areas of expertise">
              {doctor.expertise?.length ? (
                <div className="flex flex-wrap gap-2">
                  {doctor.expertise.map((item) => (
                    <Chip key={item} tone="teal">
                      {item}
                    </Chip>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No expertise recorded</p>
              )}
            </SectionCard>

            <SectionCard title="Languages">
              {doctor.languages?.length ? (
                <div className="flex flex-wrap gap-2">
                  {doctor.languages.map((item) => (
                    <Chip key={item} tone="blue">
                      {item}
                    </Chip>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No languages recorded</p>
              )}
            </SectionCard>
          </div>

          <TodaySchedule doctorId={doctor._id} />
        </div>
      ) : null}

      {tab === "availability" ? (
        <AvailabilityEditor doctorId={doctor._id} />
      ) : null}

      {tab === "appointments" ? (
        <div className="space-y-6">
          <TodaySchedule key={statsVersion} doctorId={doctor._id} />

          <AppointmentsPanel
            basePath={withPath(API_ENDPOINTS.APPOINTMENTS.BY_DOCTOR, {
              doctorId: doctor._id,
            })}
            queryKey={["doctor-appointments", doctor._id, statsVersion]}
            title="All appointments"
            showDoctor={false}
            onChanged={() => setStatsVersion((version) => version + 1)}
            action={
              <Button icon={CalendarPlus} onClick={() => setBookOpen(true)}>
                Book
              </Button>
            }
          />
        </div>
      ) : null}

      {tab === "engagement" ? (
        <EngagementPanel
          key={statsVersion}
          doctorId={doctor._id}
          subject="doctor"
        />
      ) : null}

      {editOpen ? (
        <DoctorFormModal
          doctor={doctor}
          onClose={() => setEditOpen(false)}
          onSaved={refetch}
        />
      ) : null}

      {bookOpen ? (
        <BookAppointmentModal
          lockedDoctor={doctor}
          onClose={() => setBookOpen(false)}
          onBooked={() => {
            setStatsVersion((version) => version + 1);
            setTab("appointments");
          }}
        />
      ) : null}
    </div>
  );
};

export default DoctorDetailPage;
