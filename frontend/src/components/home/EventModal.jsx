import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const EventModal = () => {
  const times = Array.from({ length: 24 }, (_, h) => {
    const hour = h % 12 === 0 ? 12 : h % 12;
    const suffix = h < 12 ? "am" : "pm";
    return `${hour} ${suffix}`;
  });

  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [startTime, setStartTime] = useState("9 am");
  const [endTime, setEndTime] = useState("5 pm");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [errors, setErrors] = useState({
    title: "",
    date: "",
    time: "",
  });

  const navigate = useNavigate();

  const to24Hour = (timeStr) => {
    const [hourStr, suffix] = timeStr.split(" ");
    let hour = parseInt(hourStr, 10) % 12;
    if (suffix === "pm") hour += 12;
    return hour;
  };

  useEffect(() => {
    const modal = document.getElementById("event-modal");

    if (!modal) return;

    const handleClose = () => {
      setErrors({ title: "", date: "", time: "" });
      setEventTitle("");
      setEventDescription("");
      setStartDate("");
      setEndDate("");
      setStartTime("9 am");
      setEndTime("5 pm");
    };

    modal.addEventListener("close", handleClose);

    return () => modal.removeEventListener("close", handleClose);
  }, []);

  const handleEventCreation = (e) => {
    e.preventDefault();

    // Reset previous errors
    setErrors({ title: "", date: "", time: "" });

    const newErrors = {};

    // Validate title
    if (!eventTitle.trim()) {
      newErrors.title = "Event name is required.";
    }

    // Validate dates
    if (!startDate || !endDate) {
      newErrors.date = "Please select both start and end dates.";
    } else if (new Date(endDate) < new Date(startDate)) {
      newErrors.date =
        "End date must be later than or equal to the start date.";
    }

    // Validate times
    if (to24Hour(endTime) <= to24Hour(startTime)) {
      newErrors.time = "End time must be later than start time.";
    }

    // If there are errors, update state and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    // Connect to backend to create event (not implemented yet)
    navigate("/event/12345");
  };

  return (
    <dialog id="event-modal" className="modal">
      <div className="modal-box bg-base-100 w-full max-w-md p-6 shadow-xl">
        {/* Close Button */}
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute top-3 right-3">
            ✕
          </button>
        </form>

        {/* Header */}
        <header className="border-base-300 mb-6 border-b pb-4 text-center">
          <h2 className="text-base-content text-2xl font-semibold">
            Create New Event
          </h2>
          <p className="text-base-content/70 mt-1 text-sm">
            Set up the event details below
          </p>
        </header>

        {/* Form */}
        <form onSubmit={handleEventCreation} className="flex flex-col gap-6">
          {/* Section: Basic Info */}
          <section>
            <h3 className="text-base-content border-primary mb-3 border-l-4 pl-3 text-base font-medium">
              Basic Information
            </h3>
            <div className="flex flex-col gap-3">
              <div>
                <label
                  htmlFor="event-name"
                  className="text-base-content/80 mb-1 block text-sm font-medium"
                >
                  Event Name
                </label>
                <input
                  id="event-name"
                  type="text"
                  className={`input input-bordered h-11 w-full ${
                    errors.title ? "border-error" : ""
                  }`}
                  placeholder="e.g. Team sync or client meeting"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                />
                {errors.title && (
                  <p className="text-error mt-1 text-xs">{errors.title}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="event-description"
                  className="text-base-content/80 mb-1 block text-sm font-medium"
                >
                  Description
                </label>
                <textarea
                  id="event-description"
                  className="textarea textarea-bordered h-24 w-full"
                  placeholder="Add optional notes or context..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Section: Date & Time */}
          <section>
            <h3 className="text-base-content border-primary mb-3 border-l-4 pl-3 text-base font-medium">
              Date & Time
            </h3>

            <div className="space-y-4">
              {/* Date Range */}
              <div className="flex flex-col gap-2">
                <label className="text-base-content/80 text-sm font-medium">
                  Date Range
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="start-date"
                    type="date"
                    className={`input input-bordered h-11 w-full ${
                      errors.date ? "border-error" : ""
                    }`}
                    value={startDate}
                    onChange={(e) => {
                      console.log(new Date().toISOString());
                      setStartDate(e.target.value);
                      if (
                        endDate &&
                        new Date(e.target.value) > new Date(endDate)
                      ) {
                        setEndDate("");
                      }
                    }}
                    min={
                      new Date(
                        new Date().getTime() -
                          new Date().getTimezoneOffset() * 60000,
                      )
                        .toISOString()
                        .split("T")[0]
                    }
                  />
                  <span className="text-base-content/60 text-sm">to</span>
                  <input
                    id="end-date"
                    type="date"
                    className={`input input-bordered h-11 w-full ${
                      errors.date ? "border-error" : ""
                    }`}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split("T")[0]}
                    disabled={!startDate}
                  />
                </div>
                {errors.date && (
                  <p className="text-error mt-1 text-xs">{errors.date}</p>
                )}
              </div>

              {/* Time Range */}
              <div className="flex flex-col gap-2">
                <label className="text-base-content/80 text-sm font-medium">
                  Time Range
                </label>
                <div className="flex items-center gap-3">
                  <select
                    id="start-time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={`select select-bordered h-11 w-full ${
                      errors.time ? "border-error" : ""
                    }`}
                  >
                    {times.map((t) => (
                      <option key={`start-${t}`}>{t}</option>
                    ))}
                  </select>
                  <span className="text-base-content/60 text-sm">to</span>
                  <select
                    id="end-time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={`select select-bordered h-11 w-full ${
                      errors.time ? "border-error" : ""
                    }`}
                  >
                    {times.map((t) => (
                      <option key={`end-${t}`}>{t}</option>
                    ))}
                  </select>
                </div>
                {errors.time && (
                  <p className="text-error mt-1 text-xs">{errors.time}</p>
                )}
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="border-base-300 flex flex-col gap-3 pt-4">
            <button
              type="submit"
              className="btn btn-primary h-12 w-full rounded-lg font-semibold"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>

      {/* Modal Backdrop */}
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default EventModal;
