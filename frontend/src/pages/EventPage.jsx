import AvailabilityModal from "@/components/event-page/AvailabilityModal";
import Participants from "@/components/event-page/Participants";
import WeeklyCalendar from "@/components/event-page/WeeklyCalendar";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

export const EventPage = () => {
  const { userId, requireAuth } = useAuth();
  const navigate = useNavigate();

  const { eventId } = useParams();
  const [eventDetails, setEventDetails] = useState(null);
  const [participants, setParticipants] = useState(null);
  const [availabilityData, setAvailabilityData] = useState(null);
  const [userAvailability, setUserAvailability] = useState(null);
  const [highlightedParticipant, setHighlightedParticipant] = useState(null);

  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(true);
  const [refreshCalendar, setRefreshCalendar] = useState(false);

  useEffect(() => {
    // Fetch event details using eventId when component mounts
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`/getEvent/${eventId}`);
        setEventDetails(response.data);
      } catch (error) {
        console.error("Failed to fetch event details:", error);
        navigate("/404");
      } finally {
        setIsLoadingEvent(false);
      }
    };

    fetchEventDetails();
  }, [eventId, navigate]);

  useEffect(() => {
    const fetchAvailabilities = async () => {
      setIsLoadingAvailability(true);
      try {
        const response = await axios.get(`/getAvailability/${eventId}`);
        setAvailabilityData(response.data);
      } catch (error) {
        console.error("Failed to fetch availabilities:", error);
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    const fetchParticipants = async () => {
      setIsLoadingParticipants(true);
      try {
        const response = await axios.get(`/getEventParticipants/${eventId}`);
        setParticipants(response.data);
      } catch (error) {
        console.error("Failed to fetch participants:", error);
      } finally {
        setIsLoadingParticipants(false);
      }
    };

    fetchAvailabilities();
    fetchParticipants();
  }, [eventId, refreshCalendar]);

  useEffect(() => {
    if (userId && availabilityData) {
      const userAvail = availabilityData.find(
        (entry) => entry.userId === userId,
      );
      setUserAvailability(userAvail || null);
    }
  }, [userId, availabilityData]);

  const showAvailabilityModal = () => {
    document.getElementById("availability-modal").showModal();
  };

  // Show loading spinner while event details are loading
  if (isLoadingEvent) {
    return <div></div>;
  }

  return (
    <>
      <AvailabilityModal
        event={eventDetails}
        onUpdate={() => setRefreshCalendar((prev) => !prev)}
        userAvailability={userAvailability}
      />
      <div className="mx-8 my-8 lg:mx-40">
        <div className="flex w-full flex-col justify-between md:flex-row">
          <div className="flex max-w-[70%] flex-col gap-4">
            <div>
              <h1 className="text-xl">{eventDetails?.Name}</h1>
              <p className="text-xs font-light text-gray-500">{`${eventDetails?.StartDate.split("T")[0].split("-").slice(-2).join("/")} - ${eventDetails?.EndDate.split("T")[0].split("-").slice(-2).join("/")}`}</p>
            </div>
            <p className="text-sm font-light text-gray-500">
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
        <div className="mt-12 flex flex-col gap-8 lg:flex-row">
          {isLoadingAvailability || isLoadingParticipants ? (
            <div></div>
          ) : (
            <>
              <WeeklyCalendar
                earliestStartDate={eventDetails?.StartDate}
                latestEndDate={eventDetails?.EndDate}
                earliestStartTime={eventDetails?.StartTime}
                latestEndTime={eventDetails?.EndTime}
                availabilityData={availabilityData}
                participants={participants}
                setHighlightedParticipant={setHighlightedParticipant}
              />
              <Participants
                participants={participants}
                highlightedParticipant={highlightedParticipant}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};
