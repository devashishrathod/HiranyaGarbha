exports.convertTimeToMinutes = (time) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

exports.isValidTimeFormat = (time) => {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(time);
};

exports.minutesToTime = (minutes) => {
  const hrs = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mins = String(minutes % 60).padStart(2, "0");
  return `${hrs}:${mins}`;
};
