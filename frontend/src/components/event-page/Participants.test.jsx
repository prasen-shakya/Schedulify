import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import Participants from "./Participants.jsx";

describe("Participants Component", () => {
  const participants = [
    { UserID: "1", Name: "alice" },
    { UserID: "2", Name: "bob" },
    { UserID: "3", Name: "charlie" },
  ];

  it("renders a list of participants", () => {
    render(<Participants participants={participants} highlightedParticipant={null} />);

    expect(screen.getByText("Event Participants")).toBeInTheDocument();

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  it("renders 'No participants yet.' when participants array is empty", () => {
    render(<Participants participants={[]} highlightedParticipant={null} />);

    expect(screen.getByText("No participants yet.")).toBeInTheDocument();
  });

  it("highlights the correct participant", () => {
    render(
      <Participants
        participants={participants}
        highlightedParticipant={["2"]}
      />
    );

    // Highlighted participant: Bob
    const bob = screen.getByText("Bob");
    expect(bob).toHaveClass("text-primary");

    // Dimmed participants: Alice & Charlie
    const alice = screen.getByText("Alice");
    const charlie = screen.getByText("Charlie");

    expect(alice).toHaveClass("text-gray-400", { exact: false });
    expect(charlie).toHaveClass("text-gray-400", { exact: false });
  });

  it("renders correct avatar initials", () => {
    render(<Participants participants={participants} highlightedParticipant={null} />);

    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
  });
});