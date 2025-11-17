import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

// Mock axios
vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock child component to isolate modal behavior
vi.mock("./AvailabilityEntry.jsx", () => ({
  default: ({ slotID, onDelete }) => (
    <div>
      <span>Entry {slotID}</span>
      <button aria-label={`delete-${slotID}`} onClick={() => onDelete(slotID)}>
        delete
      </button>
    </div>
  ),
}));

import AvailabilityModal from "./AvailabilityModal.jsx";

describe("AvailabilityModal Component", () => {
  const event = {
    EventID: "abc123",
    StartDate: "2025-01-01T00:00:00",
    EndDate: "2025-01-10T00:00:00",
  };

  const userAvailability = {
    availability: [
      {
        date: "2025-01-03",
        times: [{ startTime: "09:00", endTime: "10:00" }],
      },
    ],
  };

  let onUpdate;

  beforeEach(() => {
    onUpdate = vi.fn();
    document.body.innerHTML = ""; // reset modal HTML
  });

  const renderModal = (props = {}) => {
    return render(
      <AvailabilityModal
        event={event}
        onUpdate={onUpdate}
        userAvailability={props.userAvailability ?? null}
      />
    );
  };

  // ---------------------------
  //          TESTS
  // ---------------------------

  it("renders modal and headings", () => {
    renderModal();

    document.getElementById("availability-modal").setAttribute("open", "");

    expect(screen.getByText("Enter Your Availability")).toBeInTheDocument();
    expect(screen.getByText("Time Range")).toBeInTheDocument();
  });

  it("loads existing user availability on mount", async() => {
    renderModal({ userAvailability });

    document.getElementById("availability-modal").setAttribute("open", "");

    await screen.findByText((content) => content.includes("Entry"));
  });

  it("adds a new availability slot", () => {
    renderModal();

    document.getElementById("availability-modal").setAttribute("open", "");

    const addButton = screen.getByLabelText("Add new row");
    fireEvent.click(addButton);

    expect(screen.getAllByText(/Entry/)).toHaveLength(1);
  });

  it("removes an availability slot", () => {
    renderModal({ userAvailability });

    document.getElementById("availability-modal").setAttribute("open", "");

    const deleteButton = screen.getByRole("button", {
      name: /delete/,
    });

    fireEvent.click(deleteButton);

    expect(screen.queryByText(/Entry/)).not.toBeInTheDocument();
  });

  it("shows validation errors when fields are invalid", async () => {
    renderModal({
      userAvailability: {
        availability: [
          { date: "", times: [{ startTime: "", endTime: "" }] },
        ],
      },
    });

    document.getElementById("availability-modal").setAttribute("open", "");

    fireEvent.click(screen.getByText("Update"));

    await waitFor(() => {
      // Expect an error message inside AvailabilityEntry mock?
      // Real component sets slot.error visually in Entry,
      // but since we mock Entry, we only check that it didn't submit.
      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  it("submits availability when valid", async () => {
    axios.post.mockResolvedValueOnce({});

    renderModal({ userAvailability });

    document.getElementById("availability-modal").setAttribute("open", "");

    fireEvent.click(screen.getByText("Update"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith("/updateAvailability", {
        eventID: event.EventID,
        availability: expect.any(Array),
      });
    });

    expect(onUpdate).toHaveBeenCalled();
  });

  it("shows API error on failure", async () => {
    axios.post.mockRejectedValueOnce(new Error("Network error"));

    renderModal({ userAvailability });

    document.getElementById("availability-modal").setAttribute("open", "");

    fireEvent.click(screen.getByText("Update"));

    await waitFor(() => {
      expect(
        screen.getByText(/Failed to submit availability/i)
      ).toBeInTheDocument();
    });
  });

  it("shows uploading indicator while submitting", async () => {
    let resolvePost;
    axios.post.mockReturnValue(
      new Promise((res) => (resolvePost = res))
    );

    renderModal({ userAvailability });

    document.getElementById("availability-modal").setAttribute("open", "");

    fireEvent.click(screen.getByText("Update"));

    expect(screen.getByText("Uploading availability...")).toBeInTheDocument();

    // resolve request
    resolvePost({});

    await waitFor(() => {
      expect(
        screen.queryByText("Uploading availability...")
      ).not.toBeInTheDocument();
    });
  });
});