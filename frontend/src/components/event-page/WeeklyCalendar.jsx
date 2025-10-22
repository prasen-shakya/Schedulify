import react from "react";

export default function WeeklyCalendar() {
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeZone = Array.from({ length: 24 }, (_, i) => i );

  const earliestStartDate = new Date(2025, 12, 10);
  const latestEndDate = new Date(2025, 12, 20);



  return (
    <div className="pb-5 ">
        <div className="grid grid-cols-[4rem_repeat(7,1fr)] text-xs 
            w-[700px] cally bg-base-100 scale-100 mt-10">
            <div></div>

            {weekdays.map((day) => (
                <div
                    key={day}
                    className="font-semibold text-center py-2 border-b border-base-300"
                >
                {day}
                </div>
            ))}
        </div>


        {timeZone.map((hour) => (
        <div key={hour} className="grid grid-cols-[4rem_repeat(7,1fr)]
                w-[700px] cally bg-base-100 scale-100">
          <div className="border-r border-base-300 text-right pr-1">
            {new Date(2025, 9, 20, hour).toLocaleTimeString("en-US", {
              hour: "numeric",
              hour12: true,
            })}
          </div>

          {weekdays.map((day) => (
            <div
              key={`${day}-${hour}`}
              className="border-r border-b border-base-200 h-8 hover:bg-base-200 cursor-pointer"
            ></div>
          ))}
        </div>
        ))}
    </div>
  );
}