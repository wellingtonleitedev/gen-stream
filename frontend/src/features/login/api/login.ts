import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import api from "@/lib/api";
import { storage } from "@/utils/auth";
import type { LoginRequest, LoginResponse } from "../types";

const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationKey: ["login"],
    mutationFn: login,
    onSuccess: (data) => {
      storage.setToken(data.access_token);
      navigate("/");
    },
  });
};
