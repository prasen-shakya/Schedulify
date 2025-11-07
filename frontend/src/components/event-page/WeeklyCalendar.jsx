import { useEffect, useState } from "react";

export default function WeeklyCalendar({
  earliestStartDate,
  latestEndDate,
  earliestStartTime,
  latestEndTime,
}) {
  const [weekdays, setWeekdays] = useState([]);
  const [hours, setHours] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const visibleDays = 5;

  useEffect(() => {
    if (!earliestStartDate || !latestEndDate) return;

    const startDate = new Date(earliestStartDate);
    const endDate = new Date(latestEndDate);
    const days = [];

    const startTime = earliestStartTime;
    const endTime = latestEndTime;
    const times = [];

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      days.push(new Date(d));
    }

    const start = parseInt(startTime.split(":")[0], 10);
    const end = parseInt(endTime.split(":")[0], 10);

    for (let tempTime = start; tempTime < end; tempTime++) {
      times.push(tempTime);
    }

    setWeekdays(days);
    setHours(times);
  }, [earliestStartDate, latestEndDate, earliestStartTime, latestEndTime]);

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
            <div className="border-base-300 w-[38px] border-r pr-1">
              {new Date(0, 0, 0, hour).toLocaleTimeString("en-US", {
                hour: "numeric",
                hour12: true,
              })}
            </div>

            {currentDays.map((day) => (
              <div
                key={`${day.toISOString()}-${hour}`}
                className="border-base-200 h-[30px] cursor-pointer border-r border-b"
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
