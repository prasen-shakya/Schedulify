import EventModal from "@/components/home/EventModal";
import { useAuth } from "@/contexts/AuthContext";

export const Home = () => {
  const { requireAuth } = useAuth();

  const handleScheduleEvent = () => {
    document.getElementById("event-modal").showModal();
  };

  return (
    <>
      <EventModal />

      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-5">
        <h1 className="text-4xl font-bold">
          Schedule Events Without A Hassle.
        </h1>
        <p className="text-secondary">
          Schedule group events with ease without having to worry about
          scheduling conflicts.
        </p>
        <button
          className="btn btn-primary mt-2 h-12"
          onClick={() => requireAuth(handleScheduleEvent)}
        >
          Schedule An Event
        </button>
      </div>
    </>
  );
};
