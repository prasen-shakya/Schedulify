import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock utilities
vi.mock("@/utilities/timeUtils.js", () => ({
  parseHour: vi.fn((t) => parseInt(t.split(":")[0], 10)),
  formatHour: vi.fn((h) => `${h}:00`),
  toSqlTime: vi.fn((label) => `${label}:00`),
}));

import AvailabilityEntry from "./AvailabilityEntry";

describe("AvailabilityEntry Component", () => {
  let setAvailabilitySlots;
  let onDelete;

  const baseEvent = {
    StartTime: "09:00:00",
    EndTime: "12:00:00",
    StartDate: "2025-01-01T00:00:00",
    EndDate: "2025-01-10T00:00:00",
  };

  const baseSlot = {
    slotID: "slot1",
    selectedDate: "2025-01-05",
    error: "",
    times: [
      { timeID: "t1", startTime: "", endTime: "" }
    ]
  };

  beforeEach(() => {
    setAvailabilitySlots = vi.fn();
    onDelete = vi.fn();
  });

  const renderEntry = (slotOverrides = {}) => {
    const availabilitySlots = [{ ...baseSlot, ...slotOverrides }];

    return render(
      <table>
        <tbody>
          <AvailabilityEntry
            availabilitySlots={availabilitySlots}
            setAvailabilitySlots={setAvailabilitySlots}
            slotID="slot1"
            onDelete={onDelete}
            event={baseEvent}
          />
        </tbody>
      </table>
    );
  };

  // ----------- TESTS ------------

  it("renders date input and time dropdowns", () => {
    renderEntry();

    expect(screen.getByDisplayValue("2025-01-05")).toBeInTheDocument();
    expect(screen.getByText("Start")).toBeInTheDocument();
    expect(screen.getByText("End")).toBeInTheDocument();
  });

  it("calls onDelete when delete button clicked", () => {
    renderEntry();

    fireEvent.click(screen.getByText("✕"));

    expect(onDelete).toHaveBeenCalledWith("slot1");
  });

  it("calls setAvailabilitySlots when date changes", () => {
    renderEntry();

    fireEvent.change(screen.getByDisplayValue("2025-01-05"), {
      target: { value: "2025-01-07" }
    });

    expect(setAvailabilitySlots).toHaveBeenCalled();
  });

  it("updates start time", () => {
    renderEntry();

    const startSelect = screen.getAllByRole("combobox")[0];

    fireEvent.change(startSelect, { target: { value: "09:00:00" } });

    expect(setAvailabilitySlots).toHaveBeenCalled();
  });

  it("updates end time", () => {
    renderEntry();

    const endSelect = screen.getAllByRole("combobox")[1];

    fireEvent.change(endSelect, { target: { value: "10:00:00" } });

    expect(setAvailabilitySlots).toHaveBeenCalled();
  });

  it("adds a new time range when + is clicked", () => {
    renderEntry();

    const plusButton = screen.getByText("+");
    fireEvent.click(plusButton);

    expect(setAvailabilitySlots).toHaveBeenCalled();
  });

  it("removes a time range when - is clicked", () => {
    const slotWithTwo = {
        ...baseSlot,
        times: [
        { timeID: "t1", startTime: "", endTime: "" },
        { timeID: "t2", startTime: "", endTime: "" },
        ],
    };

    renderEntry(slotWithTwo);

    const minusButtons = screen.getAllByText("-");
    expect(minusButtons).toHaveLength(2);

    // Click the minus for the second time range
    fireEvent.click(minusButtons[1]);

    expect(setAvailabilitySlots).toHaveBeenCalled();
  });

  it("shows an error message when slot.error exists", () => {
    renderEntry({ error: "Invalid time range" });

    expect(screen.getByText("* Invalid time range")).toBeInTheDocument();
  });
});
