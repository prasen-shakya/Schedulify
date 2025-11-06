import axios from "axios";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import AvailabilityEntry from "./AvailabilityEntry.jsx";

const AvailabilityModal = ({ event }) => {
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [apiError, setApiError] = useState("");

  // --- Functions to manage availability slots ---

  const addAvailabilitySlot = () => {
    const newSlot = {
      slotID: uuid(),
      selectedDate: "",
      times: [{ startTime: "", endTime: "", timeID: uuid() }],
      error: "",
    };
    setAvailabilitySlots((prev) => [...prev, newSlot]);
  };

  const removeAvailabilitySlot = (slotID) => {
    setAvailabilitySlots((prev) =>
      prev.filter((slot) => slot.slotID !== slotID),
    );
  };

  // --- Validation function ---
  const validateAvailability = () => {
    const dateMap = {};
    let isValid = true;

    const updatedSlots = availabilitySlots.map((slot) => {
      let error = "";

      const selectedDate = slot.selectedDate;
      const startDate = event.StartDate.split("T")[0];
      const endDate = event.EndDate.split("T")[0];

      // --- Date validation ---
      if (!slot.selectedDate) {
        error = "Please select a date.";
      } else if (selectedDate > endDate || selectedDate < startDate) {
        error = "Selected date is out of event range.";
      } else if (dateMap[slot.selectedDate]) {
        error = "You have already selected this date.";
      }

      dateMap[slot.selectedDate] = true;

      // --- Time validation ---
      if (!error) {
        const unenteredTimeSlot = slot.times.some(
          (time) => !time.startTime || !time.endTime,
        );

        const invalidTimeSlot = slot.times.some(
          (time) =>
            time.startTime && time.endTime && time.startTime >= time.endTime,
        );

        if (invalidTimeSlot) {
          error = "Start time must be before end time.";
        }

        if (unenteredTimeSlot) {
          error = "Please enter all time ranges.";
        }
      }

      // -- Check for at least one time range --
      if (!error && slot.times.length > 1) {
        slot.times.forEach((time, index) => {
          const overlappingTimeSlot = slot.times.some(
            (otherTime, otherIndex) => {
              if (index === otherIndex) return false;
              return (
                time.startTime < otherTime.endTime &&
                time.endTime > otherTime.startTime
              );
            },
          );

          if (overlappingTimeSlot) {
            error = "Time ranges must not overlap.";
          }
        });
      }

      if (error) isValid = false;
      return { ...slot, error };
    });

    setAvailabilitySlots(updatedSlots);
    return isValid;
  };

  const submitAvailability = () => {
    if (isUploading) return;

    if (availabilitySlots.length === 0) {
      setApiError("Please add at least one availability slot.");
      return;
    }

    setApiError("");

    if (!validateAvailability()) return;

    // Submit the availability data
    console.log("Submitting availability:", availabilitySlots);
    setIsUploading(true);

    axios
      .post("http://localhost:3000/api/updateAvailability", {
        eventID: event.EventID,
        availability: availabilitySlots,
      })
      .then((response) => {
        console.log("Availability submitted successfully:", response.data);
        setIsUploading(false);
        // Close the modal
        document.getElementById("availability-modal").close();
      })
      .catch((error) => {
        console.error("Error submitting availability:", error);
        setApiError(
          "Failed to submit availability. Please try again. Error: " +
            error.message,
        );
        setIsUploading(false);
      });
  };

  return (
    <dialog id="availability-modal" className="modal">
      {isUploading && (
        <div role="alert" className="alert alert-info absolute top-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="h-6 w-6 shrink-0 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>Uploading availability...</span>
        </div>
      )}

      {apiError && (
        <div
          role="alert"
          className="alert alert-error absolute top-4 text-white"
        >
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
          <span>{apiError}</span>
        </div>
      )}

      <div className="modal-box max-w-2xl">
        <div className="p-4 tracking-wide">
          <p className="text-xl">Enter Your Availability</p>
          <p className="font-light text-gray-500">
            Enter your available times for the event
          </p>
        </div>

        <div className="mt-2 overflow-x-auto">
          <table className="table w-full border-collapse">
            <thead>
              <tr className="text-center text-sm tracking-wide uppercase">
                <th className="font-light">Date</th>
                <th className="font-light">Time Range</th>
              </tr>
            </thead>
            <tbody>
              {availabilitySlots.map((slot) => (
                <AvailabilityEntry
                  key={slot.slotID}
                  availabilitySlots={availabilitySlots}
                  setAvailabilitySlots={setAvailabilitySlots}
                  slotID={slot.slotID}
                  onDelete={removeAvailabilitySlot}
                  event={event}
                />
              ))}
              <tr>
                <td colSpan={2} className="p-0 align-middle">
                  <div className="my-4 flex justify-center">
                    <button
                      type="button"
                      aria-label="Add new row"
                      onClick={addAvailabilitySlot}
                      className="bg-primary hover:bg-primary/80 flex h-10 w-10 items-center justify-center rounded-full text-white transition-all duration-200 hover:scale-110 hover:cursor-pointer"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="modal-action mt-2 pt-3">
          <form className="flex gap-2">
            <button
              className="btn btn-primary font-semibold"
              onClick={(e) => {
                e.preventDefault();
                submitAvailability();
              }}
            >
              Update
            </button>
            <button
              className="btn font-medium"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("availability-modal").close();
              }}
            >
              Close
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default AvailabilityModal;
