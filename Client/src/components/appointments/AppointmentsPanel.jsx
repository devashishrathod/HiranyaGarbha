import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { toast } from "react-hot-toast";

import { useApiMutation, useGetQuery } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import Pagination from "../UI/Pagination";
import {
  Avatar,
  EmptyState,
  Pill,
  SectionCard,
  Select,
  SkeletonRows,
} from "../UI/kit";
import {
  PAYMENT_STATUS_META,
  STATUS_META,
  STATUS_OPTIONS,
} from "../../constants/appointment";
import { buildQuery, nameOf, withPath } from "../../utils/ids";
import { formatTimeRange, relativeDay } from "../../utils/datetime";
import AppointmentRowActions from "./AppointmentRowActions";
import {
  CancelAppointmentModal,
  CompleteAppointmentModal,
  RescheduleAppointmentModal,
} from "./AppointmentDialogs";

/** Actions that just flip a status, no extra input needed */
const DIRECT_ACTION_ENDPOINTS = {
  confirm: API_ENDPOINTS.APPOINTMENTS.CONFIRM,
  checkIn: API_ENDPOINTS.APPOINTMENTS.CHECK_IN,
  start: API_ENDPOINTS.APPOINTMENTS.START,
  noShow: API_ENDPOINTS.APPOINTMENTS.NO_SHOW,
};

/**
 * One appointment list, reused by the global page, the patient detail page and
 * the doctor detail page. Only the base path and the visible columns differ.
 */
const AppointmentsPanel = ({
  basePath,
  params = {},
  queryKey = [],
  title = "Appointments",
  description,
  action,
  showPatient = true,
  showDoctor = true,
  onChanged,
  filters,
  pageSize = 10,
}) => {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState(null);

  const paramsKey = JSON.stringify(params);
  const [appliedParamsKey, setAppliedParamsKey] = useState(paramsKey);

  // Parent-supplied filters changed, so the current page number is meaningless
  if (appliedParamsKey !== paramsKey) {
    setAppliedParamsKey(paramsKey);
    setPage(1);
  }

  const endpoint = useMemo(() => {
    if (!basePath) return null;
    return `${basePath}${buildQuery({
      ...params,
      status: status || undefined,
      page,
      limit: pageSize,
    })}`;
    // params is compared by value through paramsKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePath, paramsKey, status, page, pageSize]);

  const { data, isLoading, isFetching, error, refetch } = useGetQuery(endpoint, [
    ...queryKey,
    paramsKey,
    status,
    page,
    pageSize,
  ]);

  const { mutate: runAction, isPending } = useApiMutation({ method: "patch" });

  const payload = data?.data;
  const rows = payload?.data || [];
  const total = payload?.total || 0;
  const totalPages = payload?.pages || payload?.totalPages || 1;

  const afterChange = () => {
    refetch();
    onChanged?.();
  };

  const handleAction = (actionKey, appointment) => {
    if (DIRECT_ACTION_ENDPOINTS[actionKey]) {
      runAction(
        {
          url: withPath(DIRECT_ACTION_ENDPOINTS[actionKey], {
            appointmentId: appointment._id,
          }),
        },
        {
          onSuccess: (res) => {
            toast.success(res?.message || "Appointment updated");
            afterChange();
          },
        },
      );
      return;
    }

    setDialog({ type: actionKey, appointment });
  };

  const renderBody = () => {
    if (isLoading) return <SkeletonRows rows={4} />;

    if (error && error?.response?.status !== 404) {
      return (
        <EmptyState
          icon={CalendarDays}
          title="Could not load appointments"
          message={
            error?.response?.data?.message || "Please try refreshing the page."
          }
        />
      );
    }

    if (!rows.length) {
      return (
        <EmptyState
          icon={CalendarDays}
          title="No appointments found"
          message={
            status
              ? "Nothing matches this status filter yet."
              : "New bookings will show up here."
          }
        />
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-3">Appointment</th>
              {showPatient ? <th className="px-5 py-3">Patient</th> : null}
              {showDoctor ? <th className="px-5 py-3">Doctor</th> : null}
              <th className="px-5 py-3">Schedule</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((appointment) => {
              const statusMeta =
                STATUS_META[appointment.status] || STATUS_META.PENDING;
              const paymentMeta = PAYMENT_STATUS_META[appointment.paymentStatus];
              const patient = appointment.patientId;
              const doctor = appointment.doctorId;

              return (
                <tr key={appointment._id} className="hover:bg-gray-50/70">
                  <td className="px-5 py-4 align-top">
                    <p className="font-medium text-gray-900">
                      {appointment.appointmentNumber || "—"}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {appointment.appointmentType?.replace("_", " ") || "CLINIC"}
                      {appointment.duration ? ` · ${appointment.duration} min` : ""}
                    </p>
                  </td>

                  {showPatient ? (
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-center gap-3">
                        <Avatar
                          size="sm"
                          src={patient?.image}
                          name={nameOf(patient, "Patient")}
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">
                            {nameOf(patient, "Unknown patient")}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {patient?.phone ||
                              patient?.whatsappNumber ||
                              patient?.email ||
                              "—"}
                          </p>
                          {patient?.husbandOrParentName || patient?.profession ? (
                            <p className="truncate text-xs text-gray-400">
                              {[patient.husbandOrParentName, patient.profession]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                  ) : null}

                  {showDoctor ? (
                    <td className="px-5 py-4 align-top">
                      <p className="font-medium text-gray-900">
                        {nameOf(doctor, "Unknown doctor")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {doctor?.specialization || "—"}
                      </p>
                    </td>
                  ) : null}

                  <td className="px-5 py-4 align-top">
                    <p className="font-medium text-gray-900">
                      {/* startTime carries the real instant; appointmentDate is
                          only the day marker, so prefer startTime */}
                      {relativeDay(
                        appointment.startTime || appointment.appointmentDate,
                        appointment.timezone,
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTimeRange(
                        appointment.startTime,
                        appointment.endTime,
                        appointment.timezone,
                      )}
                    </p>
                  </td>

                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-col items-start gap-1.5">
                      <Pill tone={statusMeta.tone}>{statusMeta.label}</Pill>
                      {paymentMeta ? (
                        <Pill tone={paymentMeta.tone}>{paymentMeta.label}</Pill>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-right align-top">
                    <AppointmentRowActions
                      appointment={appointment}
                      busy={isPending}
                      onAction={handleAction}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const countLabel = total
    ? `${total} appointment${total === 1 ? "" : "s"}`
    : undefined;

  return (
    <>
      <SectionCard
        title={title}
        description={description || countLabel}
        bodyClassName=""
        action={
          <div className="flex flex-wrap items-center gap-2">
            {filters}
            <Select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="w-44"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            {action}
          </div>
        }
      >
        <div className={isFetching && !isLoading ? "opacity-60 transition" : ""}>
          {renderBody()}
        </div>

        {totalPages > 1 ? (
          <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-3">
            <p className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </p>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </SectionCard>

      {dialog?.type === "cancel" ? (
        <CancelAppointmentModal
          appointment={dialog.appointment}
          onClose={() => setDialog(null)}
          onDone={afterChange}
        />
      ) : null}

      {dialog?.type === "reschedule" ? (
        <RescheduleAppointmentModal
          appointment={dialog.appointment}
          onClose={() => setDialog(null)}
          onDone={afterChange}
        />
      ) : null}

      {dialog?.type === "complete" ? (
        <CompleteAppointmentModal
          appointment={dialog.appointment}
          onClose={() => setDialog(null)}
          onDone={afterChange}
        />
      ) : null}
    </>
  );
};

export default AppointmentsPanel;
