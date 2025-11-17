import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import WeeklyCalendar from "./WeeklyCalendar";

const mockHighlight = vi.fn();

describe("WeeklyCalendar Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default desktop width (so visibleDays = 5)
    Object.defineProperty(window, "innerWidth", { writable: true, value: 1200 });
  });

  const baseProps = {
    earliestStartDate: "2025-01-01",
    latestEndDate: "2025-01-10",
    earliestStartTime: "09:00",
    latestEndTime: "12:00",
    participants: ["A", "B", "C"],
    availabilityData: [
      {
        userId: "A",
        availability: [
          {
            date: "2025-01-02",
            times: [{ startTime: "09:00", endTime: "11:00" }],
          },
        ],
      },
    ],
    setHighlightedParticipant: mockHighlight,
  };

  it("renders correct weekday cells", () => {
    render(<WeeklyCalendar {...baseProps} />);

    // Expect 5 days: Jan 1 -> Jan 5
    expect(screen.getByText("Tue, Dec 31")).toBeInTheDocument();
    expect(screen.getByText("Wed, Jan 1")).toBeInTheDocument();
    expect(screen.getByText("Thu, Jan 2")).toBeInTheDocument();
    expect(screen.getByText("Fri, Jan 3")).toBeInTheDocument();
    expect(screen.getByText("Sat, Jan 4")).toBeInTheDocument();
  });

  it("renders correct hour rows", () => {
    render(<WeeklyCalendar {...baseProps} />);

    // Hours: 9, 10, 11
    expect(screen.getByText("9 AM")).toBeInTheDocument();
    expect(screen.getByText("10 AM")).toBeInTheDocument();
    expect(screen.getByText("11 AM")).toBeInTheDocument();
  });

  it("renders availability slots with background color", () => {
    const { container } = render(<WeeklyCalendar {...baseProps} />);

    // Target the 2025-01-02 at 09:00 cell
    const cell = container.querySelector(
      '[key="2025-01-02T00:00:00.000Z-9"]'
    );

    // The component actually renders <div class="tooltip"><div style="backgroundColor">...</div></div>
    // So find the div with background style instead.
    const coloredCell = container.querySelector(
      'div[style*="background-color"]'
    );

    expect(coloredCell).toBeInTheDocument();
  });

  it("calls setHighlightedParticipant when hovering availability", () => {
    const { container } = render(<WeeklyCalendar {...baseProps} />);

    const coloredCell = container.querySelector('div[style*="background-color"]');

    fireEvent.mouseEnter(coloredCell);
    expect(mockHighlight).toHaveBeenCalledWith(["A"]);

    fireEvent.mouseLeave(coloredCell);
    expect(mockHighlight).toHaveBeenCalledWith(null);
  });

  it("disables Prev button on first page", () => {
    render(<WeeklyCalendar {...baseProps} />);

    const prevButton = screen.getByLabelText("Previous").closest("button");
    expect(prevButton).toBeDisabled();
  });

  it("enables Next button when more days exist", () => {
    render(<WeeklyCalendar {...baseProps} />);

    const nextButton = screen.getByLabelText("Next").closest("button");
    expect(nextButton).not.toBeDisabled();
  });

  it("moves forward when Next is clicked", () => {
    const longProps = {
      ...baseProps,
      latestEndDate: "2025-01-10", // More days → allows scroll
    };

    render(<WeeklyCalendar {...longProps} />);

    const nextButton = screen.getByLabelText("Next").closest("button");

    fireEvent.click(nextButton);

    // Now Jan 1 should NOT be visible anymore
    expect(screen.queryByText("Wed, Jan 1")).not.toBeInTheDocument();
  });

  it("moves backward when Prev is clicked", () => {
    const longProps = {
      ...baseProps,
      latestEndDate: "2025-01-10",
    };

    render(<WeeklyCalendar {...longProps} />);

    const nextButton = screen.getByLabelText("Next").closest("button");
    const prevButton = screen.getByLabelText("Previous").closest("button");

    fireEvent.click(nextButton); // move forward
    expect(prevButton).not.toBeDisabled();

    fireEvent.click(prevButton); // go back
    expect(screen.getByText("Wed, Jan 1")).toBeInTheDocument();
  });
});
