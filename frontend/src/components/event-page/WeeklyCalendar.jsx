import { useState, useEffect } from "react";

export default function WeeklyCalendar({ earliestStartDate, latestEndDate, earliestStartTime, latestEndTime }) {
  const [weekdays, setWeekdays] = useState([]);
  const [timeZone, setTimeZone] = useState([]);

  useEffect(() => {
    if (!earliestStartDate || !latestEndDate) return;

    const startDate = new Date(earliestStartDate);
    const endDate = new Date(latestEndDate);
    const days = [];

    const startTime = earliestStartTime;
    const endTime = latestEndTime;
    const Times = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    for (let d = parseInt(startTime.split(":")[0], 10); d <= parseInt(endTime.split(":")[0], 10); d++) {
      Times.push(d);
    }

    setWeekdays(days);
    setTimeZone(Times);
  }, [earliestStartDate, latestEndDate, earliestStartTime, latestEndTime]);

  return (
    <div className="pb-5">       
      <div
        className="grid text-xs w-[750px] cally bg-base-100 scale-100 mt-10"
        style={{ gridTemplateColumns: `auto repeat(${weekdays.length > 5 ? 5 : weekdays.length}, 1fr)`}}
      >
        <div className="w-[38px]"></div>
      {/* 
        creating the columns for the calendar 
        the specific amount of days thats showing in the calendar
        and the week days with its corresponding date
      */}  
        {weekdays.slice(0,5).map((day) => (
            <div
              key={day.toISOString()}
              className="font-semibold text-center py-2 border-b border-base-300"
            >
              {day.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </div>
        ))}
      </div>

      {/* 
        creating the columns for the calendar 
        including the hours on the left side
        and the columns on the right side
      */}  
      {timeZone.map((hour) => (
        <div
          key={hour}
          className="grid w-[750px] cally text-right text-top"
          style={{
            gridTemplateColumns: `auto repeat(${weekdays.length > 5 ? 5 : weekdays.length}, 1fr)`}}
        >
          <div className="border-r border-base-300 pr-1 w-[38px]">
            {new Date(2025, 9, 20, hour).toLocaleTimeString("en-US", {
              hour: "numeric",
              hour12: true,
            })}
          </div>

          {weekdays.slice(0,5).map((day) => (
            <div
              key={`${day.toISOString()}-${hour}`}
              className="border-r border-b border-base-200 h-[30px] hover:bg-base-200 cursor-pointer"
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
}
