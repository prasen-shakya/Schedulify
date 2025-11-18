import { useEffect, useMemo, useState } from "react";

export default function WeeklyCalendar({
  earliestStartDate,
  latestEndDate,
  earliestStartTime,
  latestEndTime,
  availabilityData,
  participants,
  setHighlightedParticipant,
}) {
  // Index of the first visible day in the week array
  const [startIndex, setStartIndex] = useState(0);

  // How many days are visible at once
  const [visibleDays, setVisibleDays] = useState(5);

  // Update visible days based on screen size
  useEffect(() => {
    const updateVisibleDays = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setVisibleDays(2);
      } else if (width < 768) {
        setVisibleDays(3);
      } else if (width < 1024) {
        setVisibleDays(4);
      } else {
        setVisibleDays(5);
      }
    };

    updateVisibleDays();
  }, []);

  // Build an array of dates from earliestStartDate to latestEndDate
  const weekdays = useMemo(() => {
    if (!earliestStartDate || !latestEndDate) return [];
    const start = new Date(earliestStartDate);
    const end = new Date(latestEndDate);
    const days = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  }, [earliestStartDate, latestEndDate]);

  // Build an array of integer hours [startHour, startHour+1, ... endHour-1]
  const hours = useMemo(() => {
    if (!earliestStartTime || !latestEndTime) return [];
    const start = parseInt(earliestStartTime.split(":")[0]);
    const end = parseInt(latestEndTime.split(":")[0]);
    return Array.from({ length: end - start }, (_, i) => start + i);
  }, [earliestStartTime, latestEndTime]);

  // Precompute availability into a map: "YYYY-MM-DD-HH" -> [userId, ...]
  const availabilityMap = useMemo(() => {
    const map = {};

    if (!availabilityData) return map;

    availabilityData.forEach((u) => {
      u.availability.forEach((slot) => {
        const date = slot.date;
        slot.times.forEach((timeSlot) => {
          const start = parseInt(timeSlot.startTime.split(":")[0], 10);
          const end = parseInt(timeSlot.endTime.split(":")[0], 10);
          // Mark each hour in [start, end) as available for this user
          for (let hour = start; hour < end; hour++) {
            const key = `${date}-${hour}`;
            if (!map[key]) map[key] = [];
            map[key].push(u.userId);
          }
        });
      });
    });

    return map;
  }, [availabilityData]);

  // Advance visible window forward
  const handleNext = () => {
    if (startIndex + visibleDays < weekdays.length) {
      setStartIndex(startIndex + visibleDays);
    }
  };

  // Move visible window backward
  const handlePrev = () => {
    if (startIndex - visibleDays >= 0) {
      setStartIndex(startIndex - visibleDays);
    }
  };

  // Slice of days currently shown
  const currentDays = weekdays.slice(startIndex, startIndex + visibleDays);

  return (
    <div className="max-w-full flex-1 overflow-auto px-1 xl:max-w-3/4">
      <div className="flex max-w-full min-w-fit items-start gap-0">
        <div className="flex-1">
          {/* Header row: navigation + day labels */}
          <div
            className="bg-base-100 grid scale-100 text-[0.7rem]"
            // First column is the time gutter, rest are equal-width day columns
            style={{
              gridTemplateColumns: `minmax(2.5rem, auto) repeat(${currentDays.length > visibleDays ? visibleDays : currentDays.length}, 1fr)`,
            }}
          >
            {/* Previous button */}
            <div className="flex w-10 justify-center">
              <button
                className="btn btn-ghost btn-sm"
                onClick={handlePrev}
                disabled={startIndex == 0}
              >
                <svg
                  aria-label="Previous"
                  className="size-4 fill-current"
                  slot="previous"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M15.75 19.5 8.25 12l7.5-7.5"
                  ></path>
                </svg>
              </button>
            </div>

            {/* Day headers */}
            {currentDays.map((day) => (
              <div
                key={day.toISOString()}
                className="border-base-300 min-w-[100px] border-b pb-4 text-center font-semibold"
              >
                {day.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  timeZone: "UTC",
                })}
              </div>
            ))}
          </div>

          {/* Hour rows */}
          {hours.map((hour) => (
            <div
              key={hour}
              className="text-top grid w-full text-right text-[0.7rem]"
              style={{
                gridTemplateColumns: `minmax(2.5rem, auto) repeat(${currentDays.length > visibleDays ? visibleDays : currentDays.length}, 1fr)`,
              }}
            >
              {/* Time gutter cell */}
              <div className="border-base-300 w-10 pr-1">
                {new Date(0, 0, 0, hour).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  hour12: true,
                })}
              </div>

              {/* Availability cells per day */}
              {currentDays.map((day, index) => {
                // Key used to find users available on this date-hour cell
                const availablePeople =
                  availabilityMap[`${day.toISOString().split("T")[0]}-${hour}`];

                const isAvailable = availablePeople != null;

                return (
                  <div
                    className="tooltip"
                    key={`${day.toISOString()}-${hour}-tooltip`}
                  >
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      className={`border-base-300 h-[30px] border-r border-b ${index == 0 ? "border-l" : ""}`}
                      // Highlight participants on hover
                      onMouseEnter={() =>
                        setHighlightedParticipant(availablePeople)
                      }
                      onMouseLeave={() => setHighlightedParticipant(null)}
                      // Shade intensity based on fraction of participants available
                      style={
                        isAvailable
                          ? {
                              backgroundColor: `rgba(0, 130, 207, ${Math.max(0.15, availablePeople.length / (participants?.length || 1))})`,
                            }
                          : {}
                      }
                    ></div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Next button column */}
        <div className="flex w-10 justify-center">
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleNext}
            disabled={startIndex + visibleDays >= weekdays.length}
          >
            <svg
              aria-label="Next"
              className="size-4 fill-current"
              slot="next"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
