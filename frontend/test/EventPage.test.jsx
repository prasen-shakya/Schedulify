/** What we test:
 * - The page shows the event title: “CS370 Group Meeting Time”.
 * Clicking “Add Availability”:
 * - Calls requireAuth().
 * - Opens the availability modal <dialog>.
 */
/** What we want:
 * - The EventPage correctly reads the event ID from the URL (useParams).
 * - It protects adding availability behind authentication.
 * - The “Add Availability” button actually triggers the modal when allowed.
 */
// test/EventPage.test.jsx
import React from "react";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./utils/renderWithProviders";
import { EventPage } from "@/pages/EventPage";

// Stub the dialog used in the page
jest.mock("@/components/event-page/AvailabilityModal", () => ({
  __esModule: true,
  default: () => <dialog id="availability-modal" data-testid="availability-modal" />,
}));

// Force a specific eventId for the test
jest.mock("react-router", () => {
  const actual = jest.requireActual("react-router");
  return { ...actual, useParams: () => ({ eventId: "123" }) };
});

// Mock AuthContext with a live state again
const authLiveState = { requireAuth: (fn) => fn && fn() };
jest.mock("@/contexts/AuthContext", () => {
  const useAuth = () => authLiveState;
  const AuthProvider = ({ children }) => children;
  return { __esModule: true, useAuth, AuthProvider };
});

test("renders title and opens availability modal behind auth", async () => {
  const user = userEvent.setup();
  const requireAuth = jest.fn((fn) => fn && fn());

  authLiveState.requireAuth = requireAuth;

  renderWithProviders(<EventPage />, { route: "/event/123" });

  expect(
    screen.getByRole("heading", { name: /CS370 Group Meeting Time/i })
  ).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /Add Availability/i }));

  expect(requireAuth).toHaveBeenCalled();
  expect(screen.getByTestId("availability-modal").open).toBe(true);
});
