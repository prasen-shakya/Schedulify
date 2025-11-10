/**
 * Converts a 24-hour format hour (0–23) into a 12-hour format string with "am"/"pm".
 *
 * Example:
 *   formatHour(13) → "1 pm"
 *   formatHour(0)  → "12 am"
 */
const formatHour = (h) => {
  const hour = h % 12 === 0 ? 12 : h % 12;
  const suffix = h < 12 ? "am" : "pm";
  return `${hour} ${suffix}`;
};

/**
 * Extracts the hour (0–23) from a SQL-style time string ("HH:MM:SS" or "HH:MM").
 *
 * Example:
 *   parseHour("13:30:00") → 13
 */
const parseHour = (timeStr) => parseInt(timeStr.split(":")[0], 10);

/**
 * Converts a 12-hour time string (e.g., "1 pm") into its 24-hour integer equivalent.
 *
 * Example:
 *   to24Hour("1 am") → 1
 *   to24Hour("1 pm") → 13
 */
const to24Hour = (timeStr) => {
  const [hourStr, suffix] = timeStr.split(" ");
  let hour = parseInt(hourStr, 10) % 12;
  if (suffix === "pm") hour += 12;
  return hour;
};

/**
 * Converts a 12-hour time string (e.g., "1 pm") into a SQL-compatible time format ("HH:MM:SS").
 *
 * Example:
 *   toSqlTime("1 pm") → "13:00:00"
 *   toSqlTime("12 am") → "00:00:00"
 */
const toSqlTime = (time) => {
  const hour24 = to24Hour(time);
  return `${hour24.toString().padStart(2, "0")}:00:00`;
};

export { formatHour, parseHour, to24Hour, toSqlTime };
