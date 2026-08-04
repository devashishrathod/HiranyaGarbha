const moment = require("moment-timezone");

/**
 * Convert HH:mm into minutes
 */
const timeToMinutes = (time) => {
  if (!time) return null;

  const [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    throw new Error(`Invalid time format: ${time}`);
  }

  return hours * 60 + minutes;
};

/**
 * Convert minutes into HH:mm
 */
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);

  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

/**
 * Check whether two time ranges overlap
 */
const isTimeOverlapping = (startA, endA, startB, endB) => {
  return startA < endB && endA > startB;
};

/**
 * Check whether appointment slot
 * is inside doctor's shift
 */
const isSlotInsideShift = ({ slotStart, slotEnd, shiftStart, shiftEnd }) => {
  return slotStart >= shiftStart && slotEnd <= shiftEnd;
};

/**
 * Check whether slot falls inside break
 */
const isInsideBreak = ({ slotStart, slotEnd, breakStart, breakEnd }) => {
  if (breakStart === null || breakEnd === null) {
    return false;
  }

  return isTimeOverlapping(slotStart, slotEnd, breakStart, breakEnd);
};

/**
 * Generate slots for one shift
 */
const generateShiftSlots = ({ date, shift, timezone }) => {
  const {
    startTime,
    endTime,
    slotDuration = 30,
    breakStart = null,
    breakEnd = null,
  } = shift;

  const shiftStartMinutes = timeToMinutes(startTime);

  const shiftEndMinutes = timeToMinutes(endTime);

  if (shiftStartMinutes >= shiftEndMinutes) {
    throw new Error(`Shift startTime must be before endTime`);
  }

  const breakStartMinutes = breakStart ? timeToMinutes(breakStart) : null;

  const breakEndMinutes = breakEnd ? timeToMinutes(breakEnd) : null;

  if (
    breakStartMinutes !== null &&
    breakEndMinutes !== null &&
    breakStartMinutes >= breakEndMinutes
  ) {
    throw new Error(`Break startTime must be before break endTime`);
  }

  const slots = [];

  let current = shiftStartMinutes;

  while (current + slotDuration <= shiftEndMinutes) {
    const slotStart = current;

    const slotEnd = current + slotDuration;

    /*
     * Skip slot if it overlaps
     * doctor's break
     */
    if (
      !isInsideBreak({
        slotStart,
        slotEnd,
        breakStart: breakStartMinutes,
        breakEnd: breakEndMinutes,
      })
    ) {
      const startString = minutesToTime(slotStart);

      const endString = minutesToTime(slotEnd);

      const startDate = moment
        .tz(`${date} ${startString}`, "YYYY-MM-DD HH:mm", timezone)
        .toDate();

      const endDate = moment
        .tz(`${date} ${endString}`, "YYYY-MM-DD HH:mm", timezone)
        .toDate();

      slots.push({
        startTime: startDate,

        endTime: endDate,

        duration: slotDuration,
      });
    }

    current += slotDuration;
  }

  return slots;
};

/**
 * Generate all daily slots
 * according to weekly schedule
 */
const generateDailySlots = ({ availability, date }) => {
  const timezone = availability.timezone || "Asia/Kolkata";

  const targetDate = moment.tz(date, timezone);

  const dayOfWeek = targetDate.day();

  const schedule = availability.weeklySchedule.find(
    (item) => item.dayOfWeek === dayOfWeek,
  );

  /*
   * Doctor is unavailable
   * on this day
   */
  if (!schedule || !schedule.isAvailable) {
    return [];
  }

  const dateString = targetDate.format("YYYY-MM-DD");

  const slots = [];

  for (const shift of schedule.shifts) {
    const shiftSlots = generateShiftSlots({
      date: dateString,
      shift,
      timezone,
    });

    slots.push(...shiftSlots);
  }

  return slots.sort((a, b) => a.startTime - b.startTime);
};

/**
 * Check whether requested slot
 * exists inside doctor's schedule
 */
const isSlotAvailable = ({ availability, startTime, endTime }) => {
  const timezone = availability.timezone || "Asia/Kolkata";

  const start = moment.tz(startTime, timezone);

  const end = moment.tz(endTime, timezone);

  if (!start.isValid() || !end.isValid()) {
    return false;
  }

  if (!start.isBefore(end)) {
    return false;
  }

  const dayOfWeek = start.day();

  const schedule = availability.weeklySchedule.find(
    (item) => item.dayOfWeek === dayOfWeek,
  );

  if (!schedule || !schedule.isAvailable) {
    return false;
  }

  const requestedStartMinutes = start.hours() * 60 + start.minutes();

  const requestedEndMinutes = end.hours() * 60 + end.minutes();

  /*
   * Requested appointment
   * must belong to one shift
   */
  return schedule.shifts.some((shift) => {
    const shiftStart = timeToMinutes(shift.startTime);

    const shiftEnd = timeToMinutes(shift.endTime);

    if (requestedStartMinutes < shiftStart || requestedEndMinutes > shiftEnd) {
      return false;
    }

    /*
     * Check break
     */
    if (shift.breakStart && shift.breakEnd) {
      const breakStart = timeToMinutes(shift.breakStart);

      const breakEnd = timeToMinutes(shift.breakEnd);

      if (
        isTimeOverlapping(
          requestedStartMinutes,
          requestedEndMinutes,
          breakStart,
          breakEnd,
        )
      ) {
        return false;
      }
    }

    /*
     * Check exact slot duration
     */
    const duration = requestedEndMinutes - requestedStartMinutes;

    if (duration !== shift.slotDuration) {
      return false;
    }

    /*
     * Check slot alignment
     *
     * Example:
     * Shift = 09:00
     * Duration = 30
     *
     * Valid:
     * 09:00
     * 09:30
     * 10:00
     *
     * Invalid:
     * 09:15
     */
    const offset = requestedStartMinutes - shiftStart;

    return offset % shift.slotDuration === 0;
  });
};

module.exports = {
  timeToMinutes,
  minutesToTime,
  isTimeOverlapping,
  generateShiftSlots,
  generateDailySlots,
  isSlotAvailable,
};
