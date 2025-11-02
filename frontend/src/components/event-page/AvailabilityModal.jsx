import { useState } from "react";
import { v4 as uuid } from "uuid";
import AvailabilityEntry from "./AvailabilityEntry.jsx";

const AvailabilityModal = ({ event }) => {
  const [availabilitySlots, setAvailabilitySlots] = useState([]);

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

      const selectedDate = slot.selectedDate; // e.g., "2025-11-02"
      const startDate = event.StartDate.split("T")[0]; // "2025-11-02"
      const endDate = event.EndDate.split("T")[0]; // "2025-11-08"

      // --- Date validation ---
      if (!slot.selectedDate) {
        error = "Please select a date.";
      } else if (selectedDate > endDate || selectedDate < startDate) {
        console.log(selectedDate, startDate, endDate);
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

      // -- Check for overlapping time ranges ---
      if (!error) {
        const times = slot.times;

        times.map((time) => {
          delete time.timeID;
          return time;
        });

        console.log(times);
      }

      if (error) isValid = false;
      return { ...slot, error };
    });

    setAvailabilitySlots(updatedSlots);
    return isValid;
  };

  return (
    <dialog id="availability-modal" className="modal">
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
                validateAvailability();
              }}
            >
              Update
            </button>
            <button
              className="btn font-medium"
              onClick={(e) => {
                e.preventDefault();
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
