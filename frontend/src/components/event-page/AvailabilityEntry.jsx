import { v4 as uuid } from "uuid";

// Start time and End time are in "HH:MM:SS" format
const AvailabilityEntry = ({
  availabilitySlots,
  setAvailabilitySlots,
  slotID,
  onDelete,
  event,
}) => {
  const {
    StartTime: startTime,
    EndTime: endTime,
    StartDate: startDate,
    EndDate: endDate,
  } = event;

  // Functions to generate the time options based on the start and end times

  const parseHour = (timeStr) => parseInt(timeStr.split(":")[0], 10);

  // Function to convert 13 to "1 pm"
  const formatHour = (h) => {
    const hour = h % 12 === 0 ? 12 : h % 12;
    const suffix = h < 12 ? "am" : "pm";
    return `${hour} ${suffix}`;
  };

  // Function to convert "1 am" to "01:00:00"
  const toSqlTime = (time) => {
    const [hourStr, suffix] = time.split(" ");

    let hour = parseInt(hourStr, 10) % 12;
    if (suffix === "pm") hour += 12;

    return `${hour.toString().padStart(2, "0")}:00:00`;
  };

  const startHour = parseHour(startTime);
  const endHour = parseHour(endTime);

  const times = Array.from({ length: endHour - startHour + 1 }, (_, i) =>
    formatHour(startHour + i),
  );

  // --- Functions to manage date and time ranges within this availability slot ---

  const slot = availabilitySlots.find((s) => s.slotID === slotID);

  const addTimeRange = () => {
    setAvailabilitySlots((prev) =>
      prev.map((slot) =>
        slot.slotID === slotID
          ? {
              ...slot,
              times: [
                ...slot.times,
                { startTime: "", endTime: "", timeID: uuid() },
              ],
            }
          : slot,
      ),
    );
  };

  const removeTimeRange = (timeID) => {
    setAvailabilitySlots((prev) =>
      prev.map((slot) =>
        slot.slotID === slotID
          ? { ...slot, times: slot.times.filter((t) => t.timeID !== timeID) }
          : slot,
      ),
    );
  };

  const updateTime = (timeID, field, value) => {
    setAvailabilitySlots((prev) =>
      prev.map((slot) =>
        slot.slotID === slotID
          ? {
              ...slot,
              times: slot.times.map((t) =>
                t.timeID === timeID ? { ...t, [field]: value } : t,
              ),
              error: "",
            }
          : slot,
      ),
    );
  };

  const updateDate = (date) => {
    setAvailabilitySlots((prev) =>
      prev.map((slot) =>
        slot.slotID === slotID
          ? { ...slot, selectedDate: date, error: "" }
          : slot,
      ),
    );
  };

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="flex">
          <div className="flex w-full items-center gap-4">
            {/* Delete button */}
            <button
              className="text-xs font-bold text-red-700 hover:cursor-pointer"
              onClick={() => onDelete(slotID)}
            >
              ✕
            </button>

            {/* Date input */}
            <input
              type="date"
              className={`input input-bordered input-sm flex-1 ${slot.error ? "input-error" : ""}`}
              value={slot.selectedDate}
              min={startDate.split("T")[0]}
              max={endDate.split("T")[0]}
              onChange={(e) => updateDate(e.target.value)}
            />
          </div>
        </td>

        <td>
          <div className="flex flex-col gap-4">
            {slot?.times.map((time, index) => {
              const isLast = index === slot.times.length - 1;
              const showMinus = slot.times.length > 1;

              return (
                <div key={time.timeID} className="flex items-center gap-2">
                  <select
                    className={`select select-bordered h-8 w-full ${slot.error ? "input-error" : ""}`}
                    value={time.startTime}
                    onChange={(e) =>
                      updateTime(time.timeID, "startTime", e.target.value)
                    }
                  >
                    <option value="" key={"start-empty-option"}>
                      Start
                    </option>
                    {times.map((t, i) => (
                      <option key={`start-${t}-${i}`} value={toSqlTime(t)}>
                        {t}
                      </option>
                    ))}
                  </select>

                  <p className="text-xs">to</p>

                  <select
                    className={`select select-bordered h-8 w-full ${slot.error ? "input-error" : ""}`}
                    value={time.endTime}
                    onChange={(e) =>
                      updateTime(time.timeID, "endTime", e.target.value)
                    }
                  >
                    <option value="" key="end-empty-option">
                      End
                    </option>
                    {times.map((t, i) => (
                      <option key={`end-${t}-${i}`} value={toSqlTime(t)}>
                        {t}
                      </option>
                    ))}
                  </select>

                  {/* Add (+) button — only show for last time range */}
                  <div
                    className="text-xsm min-w-[0.5rem] text-center hover:cursor-pointer"
                    onClick={isLast ? addTimeRange : undefined}
                  >
                    {isLast ? "+" : ""}
                  </div>

                  {/* Remove (-) button — only show if more than one range */}
                  <div
                    className="text-xsm min-w-[0.5rem] text-center hover:cursor-pointer"
                    onClick={
                      showMinus ? () => removeTimeRange(time.timeID) : undefined
                    }
                  >
                    {showMinus ? "-" : ""}
                  </div>
                </div>
              );
            })}
          </div>
        </td>
      </tr>
      {slot.error && (
        <tr>
          <td colSpan={2}>
            <p className="text-xs text-red-600">* {slot.error}</p>
          </td>
        </tr>
      )}
    </>
  );
};

export default AvailabilityEntry;
