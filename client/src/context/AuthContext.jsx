import { createContext, useContext, useEffect, useState } from "react";

import api from "../services/api";

import {
  getCurrentUser,
  getToken,
  saveAuth,
  logoutUser,
  updateUser,
} from "../utils/authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = getToken();

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/profile");

        if (response.data?.success && response.data?.user) {
          updateUser(response.data.user);
          setUser(response.data.user);
        } else {
          logoutUser();
          setUser(null);
        }
      } catch (error) {
        console.error("Session restoration failed:", error);

        logoutUser();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = (token, authenticatedUser) => {
    saveAuth(token, authenticatedUser);
    setUser(authenticatedUser);
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
