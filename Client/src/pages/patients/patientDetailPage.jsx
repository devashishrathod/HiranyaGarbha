import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  CalendarPlus,
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
import { buildQuery, idOf, withPath } from "../../utils/ids";
import { ageFromDob, formatDate } from "../../utils/datetime";
import PatientFormModal from "./PatientFormModal";

const TABS = [
  { key: "overview", label: "Profile", icon: UserRound },
  { key: "appointments", label: "Appointments", icon: CalendarPlus },
  { key: "engagement", label: "Engagement", icon: Activity },
];

export const PatientDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [tab, setTab] = useState("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [statsVersion, setStatsVersion] = useState(0);

  const endpoint = useMemo(
    () =>
      userId
        ? `${API_ENDPOINTS.PATIENTS.GET_PROFILE}${buildQuery({ userId })}`
        : null,
    [userId],
  );

  const { data, isLoading, error, refetch } = useGetQuery(endpoint, [
    "patient-profile",
    userId,
  ]);

  const { mutate: removePatient, isPending: isDeleting } = useApiMutation({
    method: "delete",
  });

  const patient = data?.data;
  const account = patient?.userId;
  const primaryDoctor = patient?.primaryDoctor;

  const handleDelete = () => {
    if (
      !window.confirm(
        `Delete ${patient?.fullName || "this patient"}? Their profile and login will be deactivated.`,
      )
    ) {
      return;
    }

    removePatient(
      { url: withPath(API_ENDPOINTS.PATIENTS.DELETE, { id: patient._id }) },
      {
        onSuccess: (res) => {
          toast.success(res?.message || "Patient deleted");
          navigate("/patients");
        },
      },
    );
  };

  if (isLoading) return <InlineLoader label="Loading patient..." />;

  if (error || !patient) {
    return (
      <div className="p-6">
        <Button
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => navigate("/patients")}
        >
          Back to patients
        </Button>
        <EmptyState
          icon={UserRound}
          title="Patient profile not found"
          message={
            error?.response?.data?.message ||
            "This patient may have been removed, or the profile was never completed."
          }
        />
      </div>
    );
  }

  const age = patient.age || ageFromDob(patient.dateOfBirth);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Button
        variant="ghost"
        icon={ArrowLeft}
        className="-ml-2"
        onClick={() => navigate("/patients")}
      >
        Back to patients
      </Button>

      {/* Hero */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
          <Avatar size="xl" src={patient.image} name={patient.fullName || "?"} />

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold">
              {patient.fullName || "Unnamed patient"}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/85">
              {age ? <span>{age} years</span> : null}
              {patient.bloodGroup ? <span>Blood {patient.bloodGroup}</span> : null}
              {patient.phone ? (
                <span className="inline-flex items-center gap-1.5">
                  <Phone size={14} /> {patient.phone}
                </span>
              ) : null}
              {patient.email ? (
                <span className="inline-flex items-center gap-1.5">
                  <Mail size={14} /> {patient.email}
                </span>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {patient.currentTrimester ? (
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                  {patient.currentTrimester}
                </span>
              ) : null}
              {patient.edd ? (
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                  EDD {formatDate(patient.edd)}
                </span>
              ) : null}
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                {patient.isActive ? "Active" : "Inactive"}
              </span>
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
              icon={Trash2}
              variant="danger"
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
              <Field label="Full name" value={patient.fullName} />
              <Field
                label="Husband / parent name"
                value={patient.husbandOrParentName}
              />
              <Field label="Profession" value={patient.profession} />
              <Field
                label="Date of birth"
                value={patient.dateOfBirth ? formatDate(patient.dateOfBirth) : null}
              />
              <Field label="Age" value={age ? `${age} years` : null} />
              <Field label="Blood group" value={patient.bloodGroup} />
              <Field label="Height" value={patient.height} />
              <Field label="Weight" value={patient.weight} />
              <Field label="Email" value={patient.email} />
              <Field label="Phone" value={patient.phone} />
              <Field label="WhatsApp number" value={patient.whatsappNumber} />
              <Field
                label="Login mobile"
                value={account?.mobile ? String(account.mobile) : null}
              />
              <Field
                label="Address"
                value={patient.address}
                className="sm:col-span-2 lg:col-span-3"
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Garbhsanskar background"
            description="Captured while onboarding the patient"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field
                label="Heard about Garbhsanskar before?"
                value={patient.heardAboutGarbhsanskar}
              />
              <Field
                label="Expectations from Hiranyagarbha Garbhsanskar LLP"
                value={patient.expectationsFromHiranyagarbha}
                className="sm:col-span-2"
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Obstetric history"
            description="Pregnancy timeline and past deliveries"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field
                label="LMP"
                value={patient.lmp ? formatDate(patient.lmp) : null}
              />
              <Field
                label="EDD"
                value={patient.edd ? formatDate(patient.edd) : null}
              />
              <Field label="Current trimester" value={patient.currentTrimester} />
              <Field label="Gravida" value={patient.gravida} />
              <Field label="Para" value={patient.para} />
              <Field label="Abortions" value={patient.abortions} />
            </div>

            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-800">
                Previous deliveries
              </h3>

              {patient.previousDeliveries?.length ? (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="px-4 py-2.5">Year</th>
                        <th className="px-4 py-2.5">Type</th>
                        <th className="px-4 py-2.5">Baby weight</th>
                        <th className="px-4 py-2.5">Complications</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {patient.previousDeliveries.map((delivery, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2.5">{delivery.year || "—"}</td>
                          <td className="px-4 py-2.5">{delivery.type || "—"}</td>
                          <td className="px-4 py-2.5">
                            {delivery.babyWeight || "—"}
                          </td>
                          <td className="px-4 py-2.5">
                            {delivery.complications || "None"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400">
                  No previous deliveries recorded
                </p>
              )}
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SectionCard title="Medical conditions">
              {patient.medicalConditions?.length ? (
                <div className="flex flex-wrap gap-2">
                  {patient.medicalConditions.map((condition) => (
                    <Chip key={condition} tone="red">
                      {condition}
                    </Chip>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No conditions recorded</p>
              )}
            </SectionCard>

            <SectionCard title="Medications">
              {patient.medications?.length ? (
                <ul className="space-y-3">
                  {patient.medications.map((medication, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 rounded-xl bg-blue-50/70 p-3"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">
                          {medication.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {[medication.dosage, medication.frequency]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">No medications recorded</p>
              )}
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SectionCard
              title="Primary doctor"
              action={
                primaryDoctor?.userId ? (
                  <Button
                    variant="soft"
                    icon={Stethoscope}
                    onClick={() =>
                      navigate(`/doctors/${idOf(primaryDoctor.userId)}`)
                    }
                  >
                    Open profile
                  </Button>
                ) : null
              }
            >
              {primaryDoctor || patient.doctorDetails?.doctorName ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field
                    label="Doctor"
                    value={
                      primaryDoctor?.fullName || patient.doctorDetails?.doctorName
                    }
                  />
                  <Field
                    label="Specialization"
                    value={
                      primaryDoctor?.specialization ||
                      patient.doctorDetails?.specialization
                    }
                  />
                  <Field
                    label="Phone"
                    value={primaryDoctor?.phone || patient.doctorDetails?.phone}
                  />
                  <Field
                    label="Email"
                    value={primaryDoctor?.email || patient.doctorDetails?.email}
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  No primary doctor assigned yet
                </p>
              )}
            </SectionCard>

            <SectionCard title="Preferences & emergency contact">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field
                  label="Preferred language"
                  value={patient.preferredLanguage}
                />
                <Field
                  label="Profile status"
                  value={
                    <Pill tone={patient.isProfileCompleted ? "green" : "amber"}>
                      {patient.isProfileCompleted ? "Completed" : "Incomplete"}
                    </Pill>
                  }
                />
                <Field
                  label="Emergency contact"
                  value={patient.emergencyContact?.name}
                />
                <Field
                  label="Relationship"
                  value={patient.emergencyContact?.relationship}
                />
                <Field
                  label="Emergency phone"
                  value={patient.emergencyContact?.phone}
                />
                <Field
                  label="Emergency address"
                  value={patient.emergencyContact?.address}
                />
              </div>
            </SectionCard>
          </div>
        </div>
      ) : null}

      {tab === "appointments" ? (
        <AppointmentsPanel
          basePath={withPath(API_ENDPOINTS.APPOINTMENTS.BY_PATIENT, {
            patientId: patient._id,
          })}
          queryKey={["patient-appointments", patient._id, statsVersion]}
          title="Appointment history"
          showPatient={false}
          onChanged={() => setStatsVersion((version) => version + 1)}
          action={
            <Button icon={CalendarPlus} onClick={() => setBookOpen(true)}>
              Book
            </Button>
          }
        />
      ) : null}

      {tab === "engagement" ? (
        <EngagementPanel
          key={statsVersion}
          patientId={patient._id}
          subject="patient"
        />
      ) : null}

      {editOpen ? (
        <PatientFormModal
          patient={patient}
          onClose={() => setEditOpen(false)}
          onSaved={refetch}
        />
      ) : null}

      {bookOpen ? (
        <BookAppointmentModal
          lockedPatient={patient}
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

export default PatientDetailPage;
