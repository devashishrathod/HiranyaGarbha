import { useState } from "react";
import { CalendarCog, Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

import { usePostMutation, useGetQuery } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import SlotPicker from "../../components/appointments/SlotPicker";
import {
  Button,
  EmptyState,
  InlineLoader,
  SectionCard,
  Select,
} from "../../components/UI/kit";
import { DAYS_OF_WEEK, SLOT_DURATIONS } from "../../constants/appointment";
import { withPath } from "../../utils/ids";
import { todayInputValue } from "../../utils/datetime";

const EMPTY_SHIFT = {
  startTime: "09:00",
  endTime: "17:00",
  slotDuration: 30,
  breakStart: "",
  breakEnd: "",
};

/** Weekdays open 09:00–17:00, Sunday off — a sane starting point to edit down from */
const seedSchedule = () =>
  DAYS_OF_WEEK.map((day) => ({
    dayOfWeek: day.value,
    isAvailable: day.value !== 0,
    shifts: day.value !== 0 ? [{ ...EMPTY_SHIFT }] : [],
  }));

const normalise = (weeklySchedule = []) =>
  DAYS_OF_WEEK.map((day) => {
    const existing = weeklySchedule.find(
      (item) => item.dayOfWeek === day.value,
    );

    return {
      dayOfWeek: day.value,
      isAvailable: Boolean(existing?.isAvailable),
      shifts: (existing?.shifts || []).map((shift) => ({
        startTime: shift.startTime || "09:00",
        endTime: shift.endTime || "17:00",
        slotDuration: shift.slotDuration || 30,
        breakStart: shift.breakStart || "",
        breakEnd: shift.breakEnd || "",
      })),
    };
  });

const AvailabilityEditor = ({ doctorId }) => {
  const [schedule, setSchedule] = useState(null);
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [previewDate, setPreviewDate] = useState(todayInputValue());
  const [syncedFrom, setSyncedFrom] = useState(null);

  const endpoint = doctorId
    ? withPath(API_ENDPOINTS.DOCTOR_AVAILABILITY.GET, { doctorId })
    : null;

  const { data, isLoading, error, refetch } = useGetQuery(endpoint, [
    "doctor-availability",
    doctorId,
  ]);

  const { mutate: save, isPending } = usePostMutation(
    API_ENDPOINTS.DOCTOR_AVAILABILITY.ADD_OR_UPDATE,
  );

  /*
   * Seed the editable copy from whatever the server last returned. Adjusting
   * state during render (instead of in an effect) keeps the first paint in sync
   * and re-seeds after every save, so the server stays the source of truth.
   */
  if (data?.data && data.data !== syncedFrom) {
    setSyncedFrom(data.data);
    setSchedule(normalise(data.data.weeklySchedule));
    setTimezone(data.data.timezone || "Asia/Kolkata");
  }

  const notConfigured = error?.response?.status === 404;

  const updateDay = (dayOfWeek, patch) =>
    setSchedule((previous) =>
      previous.map((day) =>
        day.dayOfWeek === dayOfWeek ? { ...day, ...patch } : day,
      ),
    );

  const updateShift = (dayOfWeek, index, patch) =>
    setSchedule((previous) =>
      previous.map((day) => {
        if (day.dayOfWeek !== dayOfWeek) return day;

        const shifts = day.shifts.map((shift, shiftIndex) =>
          shiftIndex === index ? { ...shift, ...patch } : shift,
        );

        return { ...day, shifts };
      }),
    );

  const handleSave = () => {
    const invalidDay = schedule.find(
      (day) => day.isAvailable && day.shifts.length === 0,
    );

    if (invalidDay) {
      const label = DAYS_OF_WEEK.find(
        (day) => day.value === invalidDay.dayOfWeek,
      )?.label;
      toast.error(`Add at least one shift for ${label}, or mark it unavailable`);
      return;
    }

    save(
      {
        doctorId,
        timezone,
        weeklySchedule: schedule.map((day) => ({
          dayOfWeek: day.dayOfWeek,
          isAvailable: day.isAvailable,
          shifts: day.isAvailable
            ? day.shifts.map((shift) => ({
                startTime: shift.startTime,
                endTime: shift.endTime,
                slotDuration: Number(shift.slotDuration),
                breakStart: shift.breakStart || null,
                breakEnd: shift.breakEnd || null,
              }))
            : [],
        })),
      },
      {
        onSuccess: (res) => {
          toast.success(res?.message || "Availability saved");
          refetch();
        },
      },
    );
  };

  if (isLoading) return <InlineLoader label="Loading availability..." />;

  if (error && !notConfigured) {
    return (
      <EmptyState
        icon={CalendarCog}
        title="Could not load availability"
        message={error?.response?.data?.message}
      />
    );
  }

  if (!schedule) {
    return (
      <SectionCard>
        <EmptyState
          icon={CalendarCog}
          title="No weekly schedule yet"
          message="Appointments can only be booked once this doctor has a weekly availability. Start from a Mon–Sat 9 to 5 template and edit it."
          action={
            <Button icon={Plus} onClick={() => setSchedule(seedSchedule())}>
              Set up weekly schedule
            </Button>
          }
        />
      </SectionCard>
    );
  }

  return (
    <div className="space-y-6">
      <SectionCard
        title="Weekly availability"
        description="Slots are generated from these shifts, minus any break."
        action={
          <>
            <Select
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              className="w-44"
            >
              <option value="Asia/Kolkata">Asia/Kolkata</option>
              <option value="Asia/Dubai">Asia/Dubai</option>
              <option value="UTC">UTC</option>
            </Select>
            <Button loading={isPending} onClick={handleSave}>
              Save schedule
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {schedule.map((day) => {
            const meta = DAYS_OF_WEEK.find(
              (item) => item.value === day.dayOfWeek,
            );

            return (
              <div
                key={day.dayOfWeek}
                className={`rounded-xl border p-4 transition-colors ${
                  day.isAvailable
                    ? "border-gray-200 bg-white"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={day.isAvailable}
                      onChange={(event) =>
                        updateDay(day.dayOfWeek, {
                          isAvailable: event.target.checked,
                          shifts:
                            event.target.checked && day.shifts.length === 0
                              ? [{ ...EMPTY_SHIFT }]
                              : day.shifts,
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-900">
                      {meta?.label}
                    </span>
                    {!day.isAvailable ? (
                      <span className="text-xs text-gray-400">Closed</span>
                    ) : null}
                  </label>

                  {day.isAvailable ? (
                    <button
                      type="button"
                      onClick={() =>
                        updateDay(day.dayOfWeek, {
                          shifts: [...day.shifts, { ...EMPTY_SHIFT }],
                        })
                      }
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                    >
                      <Plus size={14} /> Add shift
                    </button>
                  ) : null}
                </div>

                {day.isAvailable ? (
                  <div className="mt-3 space-y-2">
                    {day.shifts.map((shift, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-2 items-end gap-2 rounded-lg bg-gray-50 p-3 sm:grid-cols-6"
                      >
                        <label className="block">
                          <span className="mb-1 block text-[11px] font-medium text-gray-500">
                            Start
                          </span>
                          <input
                            type="time"
                            value={shift.startTime}
                            onChange={(event) =>
                              updateShift(day.dayOfWeek, index, {
                                startTime: event.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-1 block text-[11px] font-medium text-gray-500">
                            End
                          </span>
                          <input
                            type="time"
                            value={shift.endTime}
                            onChange={(event) =>
                              updateShift(day.dayOfWeek, index, {
                                endTime: event.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-1 block text-[11px] font-medium text-gray-500">
                            Slot
                          </span>
                          <select
                            value={shift.slotDuration}
                            onChange={(event) =>
                              updateShift(day.dayOfWeek, index, {
                                slotDuration: Number(event.target.value),
                              })
                            }
                            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                          >
                            {SLOT_DURATIONS.map((duration) => (
                              <option key={duration} value={duration}>
                                {duration} min
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="block">
                          <span className="mb-1 block text-[11px] font-medium text-gray-500">
                            Break from
                          </span>
                          <input
                            type="time"
                            value={shift.breakStart}
                            onChange={(event) =>
                              updateShift(day.dayOfWeek, index, {
                                breakStart: event.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                          />
                        </label>

                        <label className="block">
                          <span className="mb-1 block text-[11px] font-medium text-gray-500">
                            Break to
                          </span>
                          <input
                            type="time"
                            value={shift.breakEnd}
                            onChange={(event) =>
                              updateShift(day.dayOfWeek, index, {
                                breakEnd: event.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() =>
                            updateDay(day.dayOfWeek, {
                              shifts: day.shifts.filter(
                                (_, shiftIndex) => shiftIndex !== index,
                              ),
                            })
                          }
                          className="mb-0.5 justify-self-start rounded-lg p-2 text-red-500 hover:bg-red-50"
                          title="Remove shift"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Break timings must sit strictly inside the shift. Leave them blank for a
          continuous shift.
        </p>
      </SectionCard>

      <SectionCard
        title="Slot preview"
        description="Exactly what the booking screen will offer for a date"
        action={
          <input
            type="date"
            value={previewDate}
            onChange={(event) => setPreviewDate(event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        }
      >
        <SlotPicker
          readOnly
          doctorId={doctorId}
          date={previewDate}
          value={null}
          onChange={() => {}}
          timezone={timezone}
        />
      </SectionCard>
    </div>
  );
};

export default AvailabilityEditor;
