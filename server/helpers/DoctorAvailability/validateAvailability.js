const {
  throwError,
  convertTimeToMinutes,
  isValidTimeFormat,
  minutesToTime,
} = require("../../utils");

const validateDuplicateDays = (weeklySchedule) => {
  const days = weeklySchedule.map((day) => day.dayOfWeek);
  const uniqueDays = [...new Set(days)];
  if (days.length !== uniqueDays.length) {
    throwError(400, "Duplicate day found in weekly schedule.");
  }
};

const validateShiftTiming = (shift) => {
  if (!isValidTimeFormat(shift.startTime)) {
    throwError(400, "Invalid start time format.");
  }
  if (!isValidTimeFormat(shift.endTime)) {
    throwError(400, "Invalid end time format.");
  }
  const start = convertTimeToMinutes(shift.startTime);
  const end = convertTimeToMinutes(shift.endTime);
  if (start >= end) {
    throwError(400, "Shift start time must be before end time.");
  }
};

const validateBreakTiming = (shift) => {
  if (!shift.breakStart || !shift.breakEnd) {
    return;
  }
  if (
    !isValidTimeFormat(shift.breakStart) ||
    !isValidTimeFormat(shift.breakEnd)
  ) {
    throwError(400, "Invalid break time.");
  }
  const start = convertTimeToMinutes(shift.startTime);
  const end = convertTimeToMinutes(shift.endTime);
  const breakStart = convertTimeToMinutes(shift.breakStart);
  const breakEnd = convertTimeToMinutes(shift.breakEnd);
  if (breakStart <= start || breakEnd >= end) {
    throwError(400, "Break should be inside shift timing.");
  }
  if (breakStart >= breakEnd) {
    throwError(400, "Break start should be before break end.");
  }
};

const isShiftOverlap = (shifts) => {
  const sorted = [...shifts].sort((a, b) => {
    return (
      convertTimeToMinutes(a.startTime) - convertTimeToMinutes(b.startTime)
    );
  });
  for (let i = 1; i < sorted.length; i++) {
    const previous = sorted[i - 1];
    const current = sorted[i];
    if (
      convertTimeToMinutes(current.startTime) <
      convertTimeToMinutes(previous.endTime)
    ) {
      return true;
    }
  }
  return false;
};

const validateWeeklySchedule = (weeklySchedule) => {
  validateDuplicateDays(weeklySchedule);
  for (const day of weeklySchedule) {
    if (!day.isAvailable) {
      continue;
    }
    if (!day.shifts || day.shifts.length === 0) {
      throwError(400, `Please add shift for day ${day.dayOfWeek}.`);
    }
    for (const shift of day.shifts) {
      validateShiftTiming(shift);
      validateBreakTiming(shift);
    }
    if (isShiftOverlap(day.shifts)) {
      throwError(400, `Shift overlap found on day ${day.dayOfWeek}.`);
    }
  }
};

exports.validateAvailability = (payload) => {
  if (!payload.weeklySchedule) {
    throwError(400, "Weekly schedule is required.");
  }
  if (payload.weeklySchedule.length !== 7) {
    throwError(400, "Weekly schedule must contain all 7 days.");
  }
  validateWeeklySchedule(payload.weeklySchedule);
};
