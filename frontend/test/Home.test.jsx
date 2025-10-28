/** What this Tests:
 - The headline text is visible (checks rendering).
 Clicking the “Schedule An Event” button:
 - Calls requireAuth() → means the page is enforcing authentication before doing anything.
 - Opens the <dialog> modal (EventModal) after the click.
 **/
/** What we want:
  - Unauthenticated users won’t get access unless requireAuth approves.
  - The modal appears when allowed.

 **/
// test/Home.test.jsx
import React from "react";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./utils/renderWithProviders";
import { Home } from "@/pages/Home";

// Provide a real dialog target so showModal() has something to open
jest.mock("@/components/home/EventModal", () => ({
  __esModule: true,
  default: () => <dialog id="event-modal" data-testid="event-modal" />,
}));

// Mock AuthContext and expose a live state object we can tweak
const authLiveState = { requireAuth: (fn) => fn && fn() };
jest.mock("@/contexts/AuthContext", () => {
  const useAuth = () => authLiveState;
  const AuthProvider = ({ children }) => children;
  return { __esModule: true, useAuth, AuthProvider };
});

test("opens event modal behind auth", async () => {
  const user = userEvent.setup();
  const requireAuth = jest.fn((fn) => fn && fn());

  // 👇 give tests control over the behavior
  authLiveState.requireAuth = requireAuth;

  renderWithProviders(<Home />);

  expect(
    screen.getByRole("heading", { name: /Schedule Events Without A Hassle\./i })
  ).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /Schedule An Event/i }));

  expect(requireAuth).toHaveBeenCalled();
  expect(screen.getByTestId("event-modal").open).toBe(true);
});

