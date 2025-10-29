// A small mutable holder you can tailor per test:
export const authState = {
  requireAuth: (fn) => (typeof fn === "function" ? fn() : undefined),
};

// Mock the real AuthContext module your components import:
jest.mock("@/contexts/AuthContext", () => {
  const useAuth = () => authState;
  const AuthProvider = ({ children }) => children;
  return { __esModule: true, useAuth, AuthProvider };
});
