import { useState } from "react";
import { useNavigate } from "react-router";

const EventModal = () => {
  // Get all of the times from 12 am to 11 pm in a string format
  const times = Array.from({ length: 24 }, (_, h) => {
    const hour = h % 12 === 0 ? 12 : h % 12;
    const suffix = h < 12 ? "am" : "pm";
    return `${hour} ${suffix}`;
  });

  const [eventTitle, setEventTitle] = useState("");
  const [startTime, setStartTime] = useState("9 am");
  const [endTime, setEndTime] = useState("5 pm");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Converts string time to a 24-hour format
  const to24Hour = (timeStr) => {
    const [hourStr, suffix] = timeStr.split(" ");
    let hour = parseInt(hourStr, 10) % 12;
    if (suffix === "pm") hour += 12;
    return hour;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!eventTitle.trim()) {
      setError("Event name is required.");
      return;
    }

    if (to24Hour(endTime) <= to24Hour(startTime)) {
      setError("End time must be later than start time.");
      return;
    }

    // TODO: CONNECT TO THE BACKEND
    navigate(`/event/12345`);
  };

  return (
    <dialog id="event-modal" className="modal">
      <div className="modal-box max-w-sm">
        {/* Close button */}
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2">
            ✕
          </button>
        </form>

        <div className="mb-4 flex flex-col gap-2">
          <h3 className="text-2xl">Create New Event</h3>
          {error && (
            <div className="alert alert-error alert-soft outline-1">
              <span>{error}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Event Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="event-name">Event Name</label>
            <input
              className="input h-12 w-full"
              type="text"
              placeholder="Event Name..."
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              id="event-name"
            />
          </div>

          {/* Time Range */}
          <div className="flex flex-col gap-2">
            <label htmlFor="start-time">What times might work?</label>
            <div className="flex items-center gap-2">
              <select
                id="start-time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="select h-12"
              >
                {times.map((t) => (
                  <option key={`start-${t}`}>{t}</option>
                ))}
              </select>

              <p className="text-secondary text-sm">to</p>

              <select
                id="end-time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="select h-12"
              >
                {times.map((t) => (
                  <option key={`end-${t}`}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {/* Create Event Button */}
            <button type="submit" className="btn btn-primary">
              Create Event
            </button>
          </div>
        </form>
      </div>

      {/* For the modal backdrop */}
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default EventModal;
