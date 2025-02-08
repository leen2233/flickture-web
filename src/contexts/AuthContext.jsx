import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../utils/axios";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await axiosClient.get("/auth/me");
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
        setCurrentUser(null);
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    const response = await axiosClient.post("/auth/login", credentials);
    const { token, user } = response.data;
    localStorage.setItem("token", token);
    setCurrentUser(user);
    return response;
  };

  const register = async (userData) => {
    const response = await axiosClient.post("/auth/register", userData);
    const { token, user } = response.data;
    localStorage.setItem("token", token);
    setCurrentUser(user);
    return response;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
  };

  const updateUser = (userData) => {
    setCurrentUser(userData);
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
  };

  if (loading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
