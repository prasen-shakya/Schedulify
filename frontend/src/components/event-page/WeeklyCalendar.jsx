import { useState, useEffect } from "react";

export default function WeeklyCalendar({ earliestStartDate, latestEndDate, earliestStartTime, latestEndTime }) {
  const [weekdays, setWeekdays] = useState([]);
  const [timeZone, setTimeZone] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const visibleDays = 5;

  useEffect(() => {
    if (!earliestStartDate || !latestEndDate) return;

    const startDate = new Date(earliestStartDate);
    const endDate = new Date(latestEndDate);
    const days = [];

    const startTime = earliestStartTime;
    const endTime = latestEndTime;
    const Times = [];

    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    const start = parseInt(startTime.split(":")[0], 10);    
    const end = parseInt(endTime.split(":")[0], 10);
    for (let d = start; d < end; d++) {
      Times.push(d);
    }

    setWeekdays(days);
    setTimeZone(Times);
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
    <div className="pb-5 w-[788px]">     
      <div
        className="grid text-xs cally bg-base-100 scale-100 mt-10"
        style={{ gridTemplateColumns: `auto repeat(${currentDays.length > 5 ? 5 : currentDays.length}, 1fr) auto`}}
      >
      <div className="w-[38px] flex justify-center" >
        <button className="btn btn-ghost btn-sm" onClick={handlePrev} disabled={startIndex == 0}>
          <svg aria-label="Previous" className="fill-current size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5"></path>
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
            className="font-semibold text-center py-2 border-b border-base-300"
          >
            {day.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </div>
      ))}


      <div className="w-[38px] flex justify-center">
      <button className="btn btn-ghost btn-sm"            
              onClick={handleNext} 
              disabled={startIndex + visibleDays >= weekdays.length}
      >
        <svg aria-label="Next" className="fill-current size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path></svg>
      </button>
      </div>
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
            gridTemplateColumns: `auto repeat(${currentDays.length > 5 ? 5 : currentDays.length}, 1fr)`}}
        >
          <div className="border-r border-base-300 pr-1 w-[38px]">
            {new Date(2025, 9, 20, hour).toLocaleTimeString("en-US", {
              hour: "numeric",
              hour12: true,
            })}
          </div>

          {currentDays.map((day) => (
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
