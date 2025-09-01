import { useEffect, useState } from "react";

// AvailabilityModal component for setting weekly availability
const AvailabilityModal = () => {
  // Days of the week
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Initialize availabity variable
  const [availability, setAvailability] = useState(
    days.reduce((acc, day) => {
      acc[day] = { times: [{ start: "", end: "" }], unavailable: false };
      return acc;
    }, {}),
  );

  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Updated availability:", availability);
  }, [availability]);

  function addAvailabilityToDay(day) {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        times: [...prev[day].times, { start: "", end: "" }],
      },
    }));
  }

  function removeAvailabilityFromDay(day) {
    setAvailability((prev) => {
      return {
        ...prev,
        [day]: {
          ...prev[day],
          times: prev[day].times.slice(0, -1),
        },
      };
    });
  }

  function updateAvailability(day, index, field, value) {
    const startTime = availability[day].times[index].start;
    const endTime = availability[day].times[index].end;

    // Helper to reset invalid value
    const resetField = (message) => {
      setError(message);
      setAvailability((prev) => {
        const updatedTimes = [...prev[day].times];
        updatedTimes[index][field] = "";
        return {
          ...prev,
          [day]: { ...prev[day], times: updatedTimes },
        };
      });
    };

    // Validation
    if (field === "start" && endTime && value >= endTime) {
      return resetField("Start time must be before end time.");
    }
    if (field === "end" && startTime && value <= startTime) {
      return resetField("End time must be after start time.");
    }

    // Clear error and update normally
    setError("");
    setAvailability((prev) => {
      const updatedTimes = [...prev[day].times];
      updatedTimes[index][field] = value;
      return {
        ...prev,
        [day]: { ...prev[day], times: updatedTimes },
      };
    });
  }

  function toggleUnavailable(day, isChecked) {
    setAvailability((prev) => {
      return {
        ...prev,
        [day]: {
          times: [{ start: "", end: "" }],
          unavailable: isChecked,
        },
      };
    });
  }

  return (
    // Modal dialog for availability
    <dialog id="availability-modal" className="modal">
      <div className="modal-box max-w-2xl">
        {/* Title section */}
        <div className="p-4 tracking-wide">
          <p className="text-xl">Set Your Weekly Availability</p>
          <p className="font-light text-gray-500">
            Enter your available times for each day of the week
          </p>

          {error && (
            <div role="alert" className="alert alert-error alert-outline mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Table for availability input */}
        <div className="mt-4 overflow-x-auto">
          <table className="table w-full border-collapse">
            <thead>
              <tr className="text-center text-sm tracking-wide uppercase">
                {/* Table headers */}
                <th className="py-2 font-light">Day</th>
                <th className="py-2 font-light">Start</th>
                <th className="py-2 font-light">End</th>
                <th className="py-2 font-light">Unavailable</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {/* Render a row for each day */}
              {days.map((day) => (
                <tr key={day} className="text-center hover:bg-gray-50">
                  {/* Day name */}
                  <td className="py-3 align-top font-medium text-gray-800">
                    {day}
                  </td>
                  {/* Start time input */}
                  <td className="align-top">
                    <div className="flex flex-col gap-2">
                      {availability[day].times.map((_, index) => (
                        <input
                          disabled={availability[day].unavailable}
                          key={`start_date_${index}`}
                          type="time"
                          className="input input-bordered input-sm w-full text-sm"
                          value={availability[day].times[index].start}
                          onChange={(e) =>
                            updateAvailability(
                              day,
                              index,
                              "start",
                              e.target.value,
                            )
                          }
                        />
                      ))}
                    </div>
                  </td>
                  {/* End time input with add button */}
                  <td className="align-top">
                    <div className="flex flex-col gap-2">
                      {availability[day].times.slice(0, -1).map((_, index) => (
                        <input
                          disabled={availability[day].unavailable}
                          key={`end_date_${index}`}
                          type="time"
                          className="input input-bordered input-sm w-full text-sm"
                          value={availability[day].times[index].end}
                          onChange={(e) =>
                            updateAvailability(
                              day,
                              index,
                              "end",
                              e.target.value,
                            )
                          }
                        />
                      ))}
                      <div className="relative">
                        <input
                          disabled={availability[day].unavailable}
                          type="time"
                          className="input input-bordered input-sm w-full text-sm"
                          value={
                            availability[day].times[
                              availability[day].times.length - 1
                            ].end
                          }
                          onChange={(e) =>
                            updateAvailability(
                              day,
                              availability[day].times.length - 1,
                              "end",
                              e.target.value,
                            )
                          }
                        />
                        {/* Add more end times button */}
                        {!availability[day].unavailable && (
                          <button
                            className="absolute top-1/2 -right-4 -translate-y-1/2 py-0 font-semibold hover:cursor-pointer"
                            onClick={() => addAvailabilityToDay(day)}
                          >
                            +
                          </button>
                        )}
                        {availability[day].times.length > 1 && (
                          <button
                            className="absolute top-1/2 -right-8 -translate-y-1/2 py-0 font-semibold hover:cursor-pointer"
                            onClick={() => removeAvailabilityFromDay(day)}
                          >
                            -
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* Unavailable checkbox */}
                  <td>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={availability[day].unavailable}
                      onChange={(e) => {
                        toggleUnavailable(day, e.target.checked);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal action buttons */}
        <div className="modal-action mt-4 pt-3">
          <form method="dialog" className="flex gap-2">
            {/* Update button */}
            <button className="btn btn-primary font-semibold">Update</button>
            {/* Close button */}
            <button className="btn font-medium">Close</button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default AvailabilityModal;
