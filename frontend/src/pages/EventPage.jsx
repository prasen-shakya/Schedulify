import AvailabilityModal from "@/components/event-page/AvailabilityModal";
import WeeklyCalendar from "@/components/event-page/WeeklyCalendar";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

export const EventPage = () => {
  const { requireAuth } = useAuth();
  const navigate = useNavigate();

  const { eventId } = useParams();
  const [eventDetails, setEventDetails] = useState(null);
  const [availabilityData, setAvailabilityData] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshCalendar, setRefreshCalendar] = useState(false);

  useEffect(() => {
    // Fetch event details using eventId when component mounts
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/getEvent/${eventId}`,
        );

        if (response.status !== 200) {
          navigate("/404");
          return;
        }

        setEventDetails(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch event details:", error);
        navigate("/404");
      }
    };

    fetchEventDetails();
  }, [eventId, navigate]);

  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/getAvailability/${eventId}`,
        );

        if (response.status === 200) {
          setAvailabilityData(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch availabilities:", error);
      }
    };

    fetchAvailabilities();
  }, [eventId, refreshCalendar]);

  const showAvailabilityModal = () => {
    document.getElementById("availability-modal").showModal();
  };

  return isLoading ? (
    <div></div>
  ) : (
    <>
      <AvailabilityModal
        event={eventDetails}
        onUpdate={() => setRefreshCalendar((prev) => !prev)}
      />
      <div className="mx-8 my-8 lg:mx-40">
        <div className="flex w-full flex-col justify-between md:flex-row">
          <div className="flex max-w-[70%] flex-col gap-2">
            <h1 className="text-2xl">{eventDetails?.Name}</h1>
            <p className="font-light text-gray-500">
              {eventDetails?.Description}
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={(event) => {
                const eventLink = `${window.location.origin}/event/${eventId}`;
                navigator.clipboard.writeText(eventLink);
                const btn = event.target;
                const originalText = btn.textContent;
                btn.disabled = true;
                btn.textContent = "Copied!";
                setTimeout(() => {
                  btn.textContent = originalText;
                  btn.disabled = false;
                }, 1500);
              }}
              className="btn btn-secondary btn-outline w-32 text-center"
            >
              Copy Link
            </button>
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
          <WeeklyCalendar
            earliestStartDate={eventDetails?.StartDate}
            latestEndDate={eventDetails?.EndDate}
            earliestStartTime={eventDetails?.StartTime}
            latestEndTime={eventDetails?.EndTime}
            availabilityData={availabilityData}
          />

          {/* <img src={weekView} className="h-[500px]" alt="" /> */}
        </div>
      </div>
    </>
  );
};
