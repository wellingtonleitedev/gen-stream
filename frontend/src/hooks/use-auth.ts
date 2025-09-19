import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { storage } from "@/utils/auth";

export const useAuth = () => {
  const navigate = useNavigate();

  const signOut = () => {
    storage.clearToken();
    navigate("/login");
  };

  return {
    isAuthenticated: storage.isAuthenticated(),
    signOut,
    token: storage.getToken(),
  };
};

export const useRequireAuth = () => {
  const navigate = useNavigate();
  const isAuthenticated = storage.isAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated;
};
