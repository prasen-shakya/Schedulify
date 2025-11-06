import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const EventModal = () => {
  const navigate = useNavigate();

  // Generate time options from 12 am to 11 pm
  const times = Array.from({ length: 24 }, (_, h) => {
    const hour = h % 12 === 0 ? 12 : h % 12;
    const suffix = h < 12 ? "am" : "pm";
    return `${hour} ${suffix}`;
  });

  // State variables
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [startTime, setStartTime] = useState("9 am");
  const [endTime, setEndTime] = useState("5 pm");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Validation limits
  const titleLimit = 20;
  const descLimit = 150;

  // Error states for each form field
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
  });

  // Convert 12-hour time string to 24-hour integer
  const to24Hour = (timeStr) => {
    const [hourStr, suffix] = timeStr.split(" ");
    let hour = parseInt(hourStr, 10) % 12;
    if (suffix === "pm") hour += 12;
    return hour;
  };

  // Convert time string to SQL time format (HH:MM:SS)
  const toSqlTime = (time) => {
    const hour24 = to24Hour(time);
    return `${hour24.toString().padStart(2, "0")}:00:00`;
  };

  // Create event API call
  const createEvent = async (eventData) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/createEvent",
        eventData,
      );
      navigate(`/event/${response.data.eventID}`);
    } catch (error) {
      console.error(
        "Error creating event:",
        error.response?.data || error.message,
      );
    }
  };

  // Reset form on modal close
  useEffect(() => {
    const modal = document.getElementById("event-modal");

    if (!modal) return;

    // Reset form fields and errors
    const handleClose = () => {
      setErrors({ title: "", description: "", date: "", time: "" });
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

  const handleEventCreation = async (e) => {
    e.preventDefault();
    setErrors({ title: "", description: "", date: "", time: "" });

    const newErrors = {};

    // Validate title
    if (!eventTitle.trim()) {
      newErrors.title = "Event name is required.";
    } else if (eventTitle.length > titleLimit) {
      newErrors.title = `Event name must be under ${titleLimit} characters.`;
    }

    // Validate description
    if (eventDescription.length > descLimit) {
      newErrors.description = `Description must be under ${descLimit} characters.`;
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

    // If errors exist, stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    // Send event to backend
    await createEvent({
      name: eventTitle,
      description: eventDescription,
      startDate,
      endDate,
      startTime: toSqlTime(startTime),
      endTime: toSqlTime(endTime),
    });
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
              {/* Event Name */}
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
                  maxLength={titleLimit}
                  className={`input input-bordered h-11 w-full ${
                    errors.title ? "border-error" : ""
                  }`}
                  placeholder="e.g. Team sync or client meeting"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  {errors.title && (
                    <p className="text-error mt-1 text-xs">{errors.title}</p>
                  )}
                  <p
                    className={`mt-1 ml-auto text-xs ${
                      eventTitle.length > titleLimit * 0.9
                        ? "text-error"
                        : "text-base-content/50"
                    }`}
                  >
                    {eventTitle.length}/{titleLimit}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="event-description"
                  className="text-base-content/80 mb-1 block text-sm font-medium"
                >
                  Description
                </label>
                <textarea
                  id="event-description"
                  className={`textarea textarea-bordered h-24 w-full ${
                    errors.description ? "border-error" : ""
                  }`}
                  placeholder="Add optional notes or context..."
                  value={eventDescription}
                  maxLength={descLimit}
                  onChange={(e) => setEventDescription(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  {errors.description && (
                    <p className="text-error mt-1 text-xs">
                      {errors.description}
                    </p>
                  )}
                  <p
                    className={`mt-1 ml-auto text-xs ${
                      eventDescription.length > descLimit * 0.9
                        ? "text-error"
                        : "text-base-content/50"
                    }`}
                  >
                    {eventDescription.length}/{descLimit}
                  </p>
                </div>
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
                      // Reset end date if start date exceeds it
                      setStartDate(e.target.value);
                      if (
                        endDate &&
                        new Date(e.target.value) > new Date(endDate)
                      ) {
                        setEndDate("");
                      }
                    }}
                    min={
                      // Set minimum to today's date
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
