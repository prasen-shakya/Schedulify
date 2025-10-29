import { useState } from "react";
import { v4 as uuid } from "uuid";
import AvailabilityEntry from "./AvailabilityEntry.jsx";

const AvailabilityModal = ({ event }) => {
  const [availabilitySlots, setAvailabilitySlots] = useState([]);

  const addAvailabilitySlot = () => {
    const newSlot = {
      slotID: uuid(),
      dateError: "test",
      selectedDate: "",
      times: [{ startTime: "", endTime: "", timeError: "", timeID: uuid() }],
    };
    setAvailabilitySlots((prev) => [...prev, newSlot]);
  };

  const removeAvailabilitySlot = (slotID) => {
    setAvailabilitySlots((prev) =>
      prev.filter((slot) => slot.slotID !== slotID),
    );
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
          <form method="dialog" className="flex gap-2">
            <button
              className="btn btn-primary font-semibold"
              onClick={() => console.log(availabilitySlots)}
            >
              Update
            </button>
            <button className="btn font-medium">Close</button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default AvailabilityModal;
