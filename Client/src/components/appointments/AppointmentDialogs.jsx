import { useState } from "react";
import { toast } from "react-hot-toast";

import { useApiMutation } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import { idOf, withPath } from "../../utils/ids";
import { toDateInputValue, todayInputValue } from "../../utils/datetime";
import { CANCELLED_BY_OPTIONS } from "../../constants/appointment";
import { Button, Modal, Select, Textarea } from "../UI/kit";
import SlotPicker from "./SlotPicker";

/* ------------------------------------------------------------------ */
/* Cancel                                                              */
/* ------------------------------------------------------------------ */

export const CancelAppointmentModal = ({ appointment, onClose, onDone }) => {
  const [cancelledBy, setCancelledBy] = useState("ADMIN");
  const [reason, setReason] = useState("");

  const { mutate, isPending } = useApiMutation({ method: "patch" });

  const submit = () => {
    if (!reason.trim()) {
      toast.error("Please add a cancellation reason");
      return;
    }

    mutate(
      {
        url: withPath(API_ENDPOINTS.APPOINTMENTS.CANCEL, {
          appointmentId: appointment._id,
        }),
        data: {
          cancelledBy,
          cancellationReason: reason.trim(),
        },
      },
      {
        onSuccess: (res) => {
          toast.success(res?.message || "Appointment cancelled");
          onDone?.();
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      open
      size="sm"
      title="Cancel appointment"
      description={appointment?.appointmentNumber}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Keep it
          </Button>
          <Button variant="danger" loading={isPending} onClick={submit}>
            Cancel appointment
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select
          label="Cancelled by"
          value={cancelledBy}
          onChange={(event) => setCancelledBy(event.target.value)}
        >
          {CANCELLED_BY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Textarea
          label="Reason"
          rows={4}
          maxLength={500}
          value={reason}
          placeholder="Why is this appointment being cancelled?"
          onChange={(event) => setReason(event.target.value)}
        />
      </div>
    </Modal>
  );
};

/* ------------------------------------------------------------------ */
/* Reschedule                                                          */
/* ------------------------------------------------------------------ */

export const RescheduleAppointmentModal = ({ appointment, onClose, onDone }) => {
  const [date, setDate] = useState(
    toDateInputValue(appointment?.appointmentDate),
  );
  const [slot, setSlot] = useState(null);

  // A slot only makes sense for the date it was generated from
  const changeDate = (nextDate) => {
    setDate(nextDate);
    setSlot(null);
  };

  const { mutate, isPending } = useApiMutation({ method: "patch" });

  const submit = () => {
    if (!slot) {
      toast.error("Please pick a new slot");
      return;
    }

    mutate(
      {
        url: withPath(API_ENDPOINTS.APPOINTMENTS.RESCHEDULE, {
          appointmentId: appointment._id,
        }),
        data: {
          appointmentDate: date,
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
      },
      {
        onSuccess: (res) => {
          toast.success(res?.message || "Appointment rescheduled");
          onDone?.();
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      open
      title="Reschedule appointment"
      description={appointment?.appointmentNumber}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button loading={isPending} onClick={submit}>
            Confirm new slot
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <label className="block">
          <span className="block text-xs font-medium text-gray-600 mb-1.5">
            New date
          </span>
          <input
            type="date"
            value={date}
            min={todayInputValue()}
            onChange={(event) => changeDate(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">
            Available slots
          </p>
          <SlotPicker
            doctorId={idOf(appointment?.doctorId)}
            date={date}
            value={slot}
            onChange={setSlot}
            timezone={appointment?.timezone}
          />
        </div>
      </div>
    </Modal>
  );
};

/* ------------------------------------------------------------------ */
/* Complete                                                            */
/* ------------------------------------------------------------------ */

export const CompleteAppointmentModal = ({ appointment, onClose, onDone }) => {
  const [notes, setNotes] = useState(appointment?.notes || "");

  const { mutate, isPending } = useApiMutation({ method: "patch" });

  const submit = () => {
    mutate(
      {
        url: withPath(API_ENDPOINTS.APPOINTMENTS.COMPLETE, {
          appointmentId: appointment._id,
        }),
        data: { notes: notes.trim() },
      },
      {
        onSuccess: (res) => {
          toast.success(res?.message || "Appointment completed");
          onDone?.();
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      open
      size="sm"
      title="Complete consultation"
      description={appointment?.appointmentNumber}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={isPending} onClick={submit}>
            Mark completed
          </Button>
        </>
      }
    >
      <Textarea
        label="Consultation notes"
        rows={6}
        maxLength={5000}
        value={notes}
        placeholder="Findings, advice, follow-up plan..."
        onChange={(event) => setNotes(event.target.value)}
      />
    </Modal>
  );
};
