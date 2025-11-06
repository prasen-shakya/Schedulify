import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { BrowserRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock react-router (since component imports from "react-router")
const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock axios
vi.mock("axios");

import EventModal from "./EventModal";

describe("EventModal Component", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("renders modal and form fields", () => {
    render(
      <BrowserRouter>
        <EventModal />
      </BrowserRouter>,
    );

    document.getElementById("event-modal")?.setAttribute("open", "");

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Create New Event/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Event Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Event/i)).toBeInTheDocument();
  });

  it("allows typing into form fields", () => {
    render(
      <BrowserRouter>
        <EventModal />
      </BrowserRouter>,
    );

    document.getElementById("event-modal")?.setAttribute("open", "");

    fireEvent.change(screen.getByLabelText(/Event Name/i), {
      target: { value: "Test Event" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "Test description" },
    });

    expect(screen.getByLabelText(/Event Name/i).value).toBe("Test Event");
    expect(screen.getByLabelText(/Description/i).value).toBe(
      "Test description",
    );
  });

  it("shows validation error when required fields are missing", async () => {
    axios.post.mockResolvedValueOnce({ data: { eventID: "12345" } });

    render(
      <BrowserRouter>
        <EventModal />
      </BrowserRouter>,
    );

    document.getElementById("event-modal")?.setAttribute("open", "");

    fireEvent.click(screen.getByText(/Create Event/i));

    await waitFor(() => {
      expect(axios.post).not.toHaveBeenCalled();
      expect(screen.getByText(/Event name is required/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Please select both start and end dates/i),
      ).toBeInTheDocument();
    });
  });

  it("shows validation error when end time is earlier than start time", async () => {
    axios.post.mockResolvedValueOnce({ data: { eventID: "12345" } });

    render(
      <BrowserRouter>
        <EventModal />
      </BrowserRouter>,
    );

    document.getElementById("event-modal")?.setAttribute("open", "");

    // Fill valid base fields
    fireEvent.change(screen.getByLabelText(/Event Name/i), {
      target: { value: "Meeting" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "Team meeting" },
    });

    // Fill valid dates
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");
    fireEvent.change(startDateInput, { target: { value: "2025-11-05" } });
    await waitFor(() => expect(endDateInput).not.toBeDisabled());
    fireEvent.change(endDateInput, { target: { value: "2025-11-05" } });

    // Invalid times (end earlier than start)
    const startTimeSelect = document.getElementById("start-time");
    const endTimeSelect = document.getElementById("end-time");

    fireEvent.change(startTimeSelect, { target: { value: "5 pm" } });
    fireEvent.change(endTimeSelect, { target: { value: "3 pm" } });

    fireEvent.click(screen.getByText(/Create Event/i));

    await waitFor(() => {
      expect(axios.post).not.toHaveBeenCalled();
      expect(
        screen.getByText(/End time must be later than start time/i),
      ).toBeInTheDocument();
    });
  });

  it("doesn't allow users to input end date before start date", async () => {
    render(
      <BrowserRouter>
        <EventModal />
      </BrowserRouter>,
    );

    document.getElementById("event-modal")?.setAttribute("open", "");

    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");

    // Set start date
    fireEvent.change(startDateInput, { target: { value: "2025-12-10" } });

    await waitFor(() => {
      expect(endDateInput).not.toBeDisabled();
    });

    // Set end date before start date
    fireEvent.change(endDateInput, { target: { value: "2025-12-11" } });

    // Change start date to after end date
    fireEvent.change(startDateInput, { target: { value: "2025-12-12" } });

    await waitFor(() => {
      expect(endDateInput.value).toBe("");
    });
  });
});
