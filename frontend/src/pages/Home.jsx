import { EventModal } from "../components/home/EventModal";

export const Home = () => {
  return (
    <>
      <EventModal />

      <div className="py-5 px-5 flex-1 flex justify-center items-center flex-col gap-2">
        <h1 className="text-4xl font-bold">
          Schedule Events Without A Hassle.
        </h1>
        <p className="text-secondary ">
          Schedule group events with ease without having to worry about
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
