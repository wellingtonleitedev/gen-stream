import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import api from "@/lib/api";
import { storage } from "@/utils/auth";
import type { LoginFormData } from "../schemas/login-schema";

const login = async (data: LoginFormData) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationKey: ["login"],
    mutationFn: login,
    onSuccess: (data) => {
      storage.setToken(data.token);
      navigate("/");
    },
  });
};
