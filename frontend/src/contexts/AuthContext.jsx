import AuthenticationModal from "@/components/authentication/AuthenticationModal";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on mount because JWT might expire
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get(`/checkAuthenticationStatus`);
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const showAuthenticationModal = () => {
    document.getElementById("authentication-modal").showModal();
  };

  const signIn = async (email, password) => {
    try {
      await axios.post(`/login`, {
        email,
        password,
      });

      setIsAuthenticated(true);

      return "success";
    } catch (error) {
      console.error(
        "Login error:",
        error.response ? error.response.data : error.message,
      );
      return error.response.data;
    }
  };

  const signOut = async () => {
    try {
      await axios.post(`/logout`);
      setIsAuthenticated(false);
    } catch (error) {
      console.error(
        "Logout error:",
        error.response ? error.response.data : error.message,
      );
    }
  };

  const register = async (name, email, password) => {
    try {
      await axios.post(`/register`, {
        name,
        email,
        password,
      });
      setIsAuthenticated(true);
      return "success";
    } catch (error) {
      console.error(
        "Registration error:",
        error.response ? error.response.data : error.message,
      );
      return error.response?.data || { message: "Registration failed" };
    }
  };

  // This function is an authentication guard for actions that require authentication
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
        register,
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
