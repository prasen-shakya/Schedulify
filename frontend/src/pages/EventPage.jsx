import { useParams } from "react-router";
import weekView from "../images/week-view.png";

export const EventPage = () => {
  // We will use eventId later on as the primary key for the event database
  const { eventId } = useParams();

  return (
    <div className="my-8 lg:mx-40">
      <div className="flex w-full flex-col justify-between xl:flex-row">
        <h1 className="text-3xl font-light">Placeholder Event Name</h1>
        <div className="flex gap-4">
          <button className="btn btn-secondary btn-outline">Copy Link</button>
          <button className="btn btn-primary w-44">Add Availability</button>
        </div>
      </div>
      <div className="mt-12">
        <p>Group Availability</p>
        <img src={weekView} className="h-[500px]" alt="" />
      </div>
    </div>
  );
};
