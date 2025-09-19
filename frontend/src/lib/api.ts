import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((request) => {
  const token = localStorage.getItem("authToken");

  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

export default api;
