import { createContext, useContext, useState } from "react";
import AuthenticationModal from "../components/authentication/AuthenticationModal";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const showAuthenticationModal = () => {
    document.getElementById("authentication-modal").showModal();
  };

  const signIn = () => {
    setIsAuthenticated(true);
  };

  const signOut = () => {
    setUserId(null);
    setIsAuthenticated(false);
  };

  const requireAuth = (onSuccess) => {
    if (!isAuthenticated) {
      showAuthenticationModal();
      return;
    }

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        requireAuth,
        showAuthenticationModal,
        signIn,
        signOut,
      }}
    >
      <AuthenticationModal />
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
