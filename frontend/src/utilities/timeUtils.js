// Converts a 24-hour format hour (0–23) into a 12-hour format string with "am"/"pm".
const formatHour = (h) => {
  const hour = h % 12 === 0 ? 12 : h % 12;
  const suffix = h < 12 ? "am" : "pm";
  return `${hour} ${suffix}`;
};

// Extracts the hour (0–23) from a SQL-style time string ("HH:MM:SS" or "HH:MM").
const parseHour = (timeStr) => parseInt(timeStr.split(":")[0], 10);

// Converts a 12-hour time string (e.g., "1 pm") into its 24-hour integer equivalent.
const to24Hour = (timeStr) => {
  const [hourStr, suffix] = timeStr.split(" ");
  let hour = parseInt(hourStr, 10) % 12;
  if (suffix === "pm") hour += 12;
  return hour;
};

// Converts a 12-hour time string (e.g., "1 pm") into a SQL-compatible time format ("HH:MM:SS").
const toSqlTime = (time) => {
  const hour24 = to24Hour(time);
  return `${hour24.toString().padStart(2, "0")}:00:00`;
};

export { formatHour, parseHour, to24Hour, toSqlTime };
