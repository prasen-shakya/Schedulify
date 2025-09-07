import { EventModal } from "../components/home/EventModal";

export const Home = () => {
  return (
    <>
      <EventModal />

      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-5">
        <h1 className="text-4xl font-bold">
          Schedule Events Without A Hassle.
        </h1>
        <p className="text-secondary">
          Schedule your group events with ease without having to worry about
          scheduling conflicts.
        </p>
        <button
          className="btn btn-primary mt-2 h-12"
          onClick={() => document.getElementById("event-modal").showModal()}
        >
          Schedule An Event
        </button>
      </div>
    </>
  );
};
