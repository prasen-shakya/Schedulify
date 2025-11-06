import { useMemo, useState } from "react";

export default function WeeklyCalendar({
  earliestStartDate,
  latestEndDate,
  earliestStartTime,
  latestEndTime,
  availabilityData,
}) {
  const [startIndex, setStartIndex] = useState(0);
  const visibleDays = 5;

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

  const hours = useMemo(() => {
    if (!earliestStartTime || !latestEndTime) return [];
    const start = parseInt(earliestStartTime.split(":")[0]);
    const end = parseInt(latestEndTime.split(":")[0]);
    return Array.from({ length: end - start }, (_, i) => start + i);
  }, [earliestStartTime, latestEndTime]);

  const availabilityMap = useMemo(() => {
    const map = {};

    if (!availabilityData) return map;

    availabilityData.forEach((u) => {
      u.availability.forEach((slot) => {
        const date = slot.date; // already YYYY-MM-DD
        slot.times.forEach((timeSlot) => {
          const start = parseInt(timeSlot.startTime.split(":")[0], 10);
          const end = parseInt(timeSlot.endTime.split(":")[0], 10);
          for (let hour = start; hour < end; hour++) {
            const key = `${date}-${hour}`;
            if (!map[key]) map[key] = [];
            map[key].push(u.user);
          }
        });
      });
    });

    return map;
  }, [availabilityData]);

  const handleNext = () => {
    if (startIndex + visibleDays < weekdays.length) {
      setStartIndex(startIndex + visibleDays);
    }
  };

  const handlePrev = () => {
    if (startIndex - visibleDays >= 0) {
      setStartIndex(startIndex - visibleDays);
    }
  };

  const currentDays = weekdays.slice(startIndex, startIndex + visibleDays);

  return (
    <div className="overflow-auto px-1">
      <div className="w-[788px]">
        <div
          className="bg-base-100 mt-10 grid scale-100 text-[0.7rem]"
          style={{
            gridTemplateColumns: `auto repeat(${currentDays.length > visibleDays ? visibleDays : currentDays.length}, 1fr) auto`,
          }}
        >
          <div className="flex w-[38px] justify-center">
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

          {/* 
            creating the columns for the calendar 
            the specific amount of days thats showing in the calendar
            and the week days with its corresponding date
          */}
          {currentDays.map((day) => (
            <div
              key={day.toISOString()}
              className="border-base-300 border-b py-2 text-center font-semibold"
            >
              {day.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
          ))}

          <div className="flex w-[38px] justify-center">
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

        {/* 
          creating the columns for the calendar 
          including the hours on the left side
          and the columns on the right side
        */}
        {hours.map((hour) => (
          <div
            key={hour}
            className="text-top grid w-[750px] text-right text-[0.7rem]"
            style={{
              gridTemplateColumns: `auto repeat(${currentDays.length > visibleDays ? visibleDays : currentDays.length}, 1fr)`,
            }}
          >
            <div className="border-base-300 w-[38px] pr-1">
              {new Date(0, 0, 0, hour).toLocaleTimeString("en-US", {
                hour: "numeric",
                hour12: true,
              })}
            </div>

            {currentDays.map((day, index) => {
              const availablePeople =
                availabilityMap[`${day.toISOString().split("T")[0]}-${hour}`];

              const isAvailable = availablePeople != null;

              return (
                <div
                  className="tooltip"
                  data-tip={isAvailable ? availablePeople.join(", ") : ""}
                  key={`${day.toISOString()}-${hour}-tooltip`}
                >
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className={`border-base-300 h-[30px] border-r border-b ${index == 0 ? "border-l" : ""}`}
                    style={
                      isAvailable
                        ? {
                            backgroundColor: `rgba(0, 130, 207, ${Math.max(0.15, availablePeople.length / 3.0)})`,
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
    </div>
  );
}
