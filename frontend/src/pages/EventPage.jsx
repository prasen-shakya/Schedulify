import { useParams } from "react-router";
import AvailabilityModal from "@/components/event-page/AvailabilityModal";
import WeeklyCalendar from "@/components/event-page/WeeklyCalendar";
import { useAuth } from "@/contexts/AuthContext";

export const EventPage = () => {
  // We will use eventId later on as the primary key for the event database
  const { eventId } = useParams();
  const { requireAuth } = useAuth();

  const showAvailabilityModal = () => {
    document.getElementById("availability-modal").showModal();
  };

  return (
    <>
      <AvailabilityModal />
      <div className="mx-8 my-8 lg:mx-40">
        <div className="flex w-full flex-col justify-between md:flex-row">
          <h1 className="text-3xl font-light">CS370 Group Meeting Time</h1>
          <div className="flex gap-4">
            <button className="btn btn-secondary btn-outline">Copy Link</button>
            <button
              onClick={() => requireAuth(showAvailabilityModal)}
              className="btn btn-primary w-44"
            >
              Add Availability
            </button>
          </div>
        </div>       
        <div className="mt-12">
          <p>Group Availability</p>
          < WeeklyCalendar />

          {/* <img src={weekView} className="h-[500px]" alt="" /> */}
        </div>
      </div>


    </>
  );
};
