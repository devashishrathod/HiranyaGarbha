import { useMemo } from "react";
import { CalendarX2 } from "lucide-react";

import { useGetQuery } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import { buildQuery } from "../../utils/ids";
import { formatTime } from "../../utils/datetime";
import { EmptyState, InlineLoader } from "../UI/kit";

/**
 * Renders the doctor's generated slots for one date and lets the caller pick one.
 * Booked slots stay visible but disabled so the admin can see how full the day is.
 */
const SlotPicker = ({
  doctorId,
  date,
  value,
  onChange,
  timezone,
  readOnly = false,
}) => {
  const endpoint = useMemo(() => {
    if (!doctorId || !date) return null;
    return `${API_ENDPOINTS.APPOINTMENTS.SLOTS}${buildQuery({
      doctorId,
      appointmentDate: date,
    })}`;
  }, [doctorId, date]);

  const { data, isLoading, error } = useGetQuery(endpoint, [
    "appointment-slots",
    doctorId,
    date,
  ]);

  const slots = useMemo(() => {
    const payload = data?.data;
    if (!payload) return [];

    const available = (payload.availableSlots || []).map((slot) => ({
      ...slot,
      available: true,
    }));
    const booked = (payload.bookedSlots || []).map((slot) => ({
      ...slot,
      available: false,
    }));

    return [...available, ...booked].sort(
      (a, b) => new Date(a.startTime) - new Date(b.startTime),
    );
  }, [data]);

  const zone = data?.data?.timezone || timezone;

  if (!doctorId) {
    return (
      <p className="text-sm text-gray-500">Select a doctor to load slots.</p>
    );
  }

  if (!date) {
    return <p className="text-sm text-gray-500">Pick a date to load slots.</p>;
  }

  if (isLoading) return <InlineLoader label="Loading slots..." />;

  if (error) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="No slots available"
        message={
          error?.response?.data?.message ||
          "This doctor has no availability configured for the selected date."
        }
      />
    );
  }

  if (!slots.length) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="Doctor is off on this day"
        message="Try another date, or update the doctor's weekly availability."
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {slots.map((slot) => {
          const key = new Date(slot.startTime).toISOString();
          const isSelected =
            value && new Date(value.startTime).toISOString() === key;

          const freeClass = readOnly
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50";

          return (
            <button
              key={key}
              type="button"
              disabled={readOnly || !slot.available}
              onClick={() => onChange(slot)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                isSelected
                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                  : slot.available
                    ? freeClass
                    : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 line-through"
              } ${readOnly ? "cursor-default" : ""}`}
            >
              {formatTime(slot.startTime, zone)}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-gray-500">
        {slots.filter((slot) => slot.available).length} of {slots.length} slots
        free · timings in {zone}
      </p>
    </div>
  );
};

export default SlotPicker;
