import { v4 as uuid } from "uuid";

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

  const parseHour = (timeStr) => parseInt(timeStr.split(":")[0], 10);

  const formatHour = (h) => {
    const hour = h % 12 === 0 ? 12 : h % 12;
    const suffix = h < 12 ? "am" : "pm";
    return `${hour} ${suffix}`;
  };

  const startHour = parseHour(startTime);
  const endHour = parseHour(endTime);

  const times = Array.from({ length: endHour - startHour + 1 }, (_, i) =>
    formatHour(startHour + i),
  );

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
            }
          : slot,
      ),
    );
  };

  return (
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
            className={`input input-bordered input-sm flex-1 ${slot.dateError ? "input-error" : ""}`}
            min={startDate.split("T")[0]}
            max={endDate.split("T")[0]}
            onChange={(e) =>
              setAvailabilitySlots((prev) =>
                prev.map((slot) =>
                  slot.slotID === slotID
                    ? { ...slot, selectedDate: e.target.value }
                    : slot,
                ),
              )
            }
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
                  className="select select-bordered h-8 w-full"
                  value={time.startTime}
                  onChange={(e) =>
                    updateTime(time.timeID, "startTime", e.target.value)
                  }
                >
                  <option value="">Start</option>
                  {times.map((t) => (
                    <option key={`start-${t}`}>{t}</option>
                  ))}
                </select>

                <p className="text-xs">to</p>

                <select
                  className="select select-bordered h-8 w-full"
                  value={time.endTime}
                  onChange={(e) =>
                    updateTime(time.timeID, "endTime", e.target.value)
                  }
                >
                  <option value="">End</option>
                  {times.map((t) => (
                    <option key={`end-${t}`}>{t}</option>
                  ))}
                </select>

                {/* Show + only on last time range */}
                {isLast ? (
                  <div
                    className="text-xsm hover:cursor-pointer"
                    onClick={addTimeRange}
                  >
                    +
                  </div>
                ) : (
                  <div>&nbsp;&nbsp;</div>
                )}

                {/* Show - only if there are multiple time ranges */}
                {showMinus ? (
                  <div
                    className="text-xsm hover:cursor-pointer"
                    onClick={() => removeTimeRange(time.timeID)}
                  >
                    -
                  </div>
                ) : (
                  <div>&nbsp;&nbsp;</div>
                )}
              </div>
            );
          })}
        </div>
      </td>
    </tr>
  );
};

export default AvailabilityEntry;
