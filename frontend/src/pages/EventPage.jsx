import AvailabilityModal from "@/components/event-page/AvailabilityModal";
import { useAuth } from "@/contexts/AuthContext";
import weekView from "@/images/week-view.png";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

export const EventPage = () => {
  // We will use eventId later on as the primary key for the event database
  const { eventId } = useParams();
  const { requireAuth } = useAuth();
  const [eventDetails, setEventDetails] = useState(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch event details using eventId when component mounts
    const fetchEventDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/getEvent/${eventId}`,
          {
            method: "GET",
            credentials: "include", // include cookies for authentication
          },
        );

        if (!response.ok) {
          navigate("/404");
          return;
        }

        const eventData = await response.json();
        setEventDetails(eventData);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch event details:", error);
      }
    };

    fetchEventDetails();
  }, [eventId, navigate]);

  const showAvailabilityModal = () => {
    document.getElementById("availability-modal").showModal();
  };

  return isLoading ? (
    <div className="flex h-full w-full flex-1 items-center justify-center">
      <span className="loading loading-spinner text-primary w-12"></span>
    </div>
  ) : (
    <>
      <AvailabilityModal event={eventDetails} />
      <div className="mx-8 my-8 lg:mx-40">
        <div className="flex w-full flex-col justify-between md:flex-row">
          <div className="flex max-w-[70%] flex-col gap-2">
            <h1 className="text-2xl">{eventDetails?.Name}</h1>
            <p className="font-light text-gray-500">
              {eventDetails?.Description}
            </p>
          </div>
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
          <img src={weekView} className="h-[500px]" alt="" />
        </div>
      </div>
    </>
  );
};
