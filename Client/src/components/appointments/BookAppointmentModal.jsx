import { useState } from "react";
import { toast } from "react-hot-toast";

import { usePostMutation } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import { APPOINTMENT_TYPES } from "../../constants/appointment";
import { todayInputValue } from "../../utils/datetime";
import { Button, Input, Modal, Select, Textarea } from "../UI/kit";
import EntityPicker from "./EntityPicker";
import SlotPicker from "./SlotPicker";

/**
 * Admin booking flow. `lockedPatient` / `lockedDoctor` pin one side of the
 * booking when the modal is opened from a patient or doctor detail page.
 */
const BookAppointmentModal = ({
  onClose,
  onBooked,
  lockedPatient = null,
  lockedDoctor = null,
}) => {
  const [patient, setPatient] = useState(lockedPatient);
  const [doctor, setDoctor] = useState(lockedDoctor);
  const [date, setDate] = useState(todayInputValue());
  const [slot, setSlot] = useState(null);
  const [appointmentType, setAppointmentType] = useState("CLINIC");
  const [consultationFee, setConsultationFee] = useState(
    lockedDoctor?.consultationFee != null
      ? String(lockedDoctor.consultationFee)
      : "",
  );
  const [symptoms, setSymptoms] = useState("");
  const [notes, setNotes] = useState("");

  // A slot only makes sense for the doctor and date it was generated from
  const changeDate = (nextDate) => {
    setDate(nextDate);
    setSlot(null);
  };

  const changeDoctor = (nextDoctor) => {
    setDoctor(nextDoctor);
    setSlot(null);
    if (nextDoctor?.consultationFee != null) {
      setConsultationFee(String(nextDoctor.consultationFee));
    }
  };

  const { mutate, isPending } = usePostMutation(API_ENDPOINTS.APPOINTMENTS.BOOK);

  const submit = () => {
    if (!patient?._id) return toast.error("Please select a patient");
    if (!doctor?._id) return toast.error("Please select a doctor");
    if (!slot) return toast.error("Please pick an available slot");

    return mutate(
      {
        patientId: patient._id,
        doctorId: doctor._id,
        scheduledBy: "ADMIN",
        appointmentDate: date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: slot.duration,
        appointmentType,
        ...(consultationFee !== ""
          ? { consultationFee: Number(consultationFee) }
          : {}),
        ...(symptoms.trim() ? { symptoms: symptoms.trim() } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      },
      {
        onSuccess: (res) => {
          toast.success(res?.message || "Appointment booked");
          onBooked?.();
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      open
      size="lg"
      title="Book appointment"
      description="Slots come straight from the doctor's weekly availability."
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={isPending} onClick={submit}>
            Book appointment
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <EntityPicker
          label="Patient"
          basePath={API_ENDPOINTS.PATIENTS.GET_ALL}
          value={patient}
          onChange={setPatient}
          disabled={Boolean(lockedPatient)}
        />

        <EntityPicker
          label="Doctor"
          basePath={API_ENDPOINTS.DOCTORS.GET_ALL}
          value={doctor}
          onChange={changeDoctor}
          subtitleKey="specialization"
          placeholder="Search by name or specialization"
          disabled={Boolean(lockedDoctor)}
        />

        <Input
          label="Date"
          type="date"
          value={date}
          min={todayInputValue()}
          onChange={(event) => changeDate(event.target.value)}
        />

        <Select
          label="Appointment type"
          value={appointmentType}
          onChange={(event) => setAppointmentType(event.target.value)}
        >
          {APPOINTMENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>

        <div className="lg:col-span-2">
          <p className="mb-2 text-xs font-medium text-gray-600">
            Available slots
          </p>
          <SlotPicker
            doctorId={doctor?._id}
            date={date}
            value={slot}
            onChange={setSlot}
          />
        </div>

        <Input
          label="Consultation fee (₹)"
          type="number"
          min="0"
          value={consultationFee}
          placeholder="Defaults to the doctor's fee"
          onChange={(event) => setConsultationFee(event.target.value)}
        />

        <Input
          label="Symptoms"
          value={symptoms}
          maxLength={2000}
          placeholder="Reason for the visit"
          onChange={(event) => setSymptoms(event.target.value)}
        />

        <Textarea
          label="Notes"
          rows={3}
          maxLength={5000}
          value={notes}
          className="lg:col-span-2"
          placeholder="Anything the doctor should know beforehand"
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>
    </Modal>
  );
};

export default BookAppointmentModal;
