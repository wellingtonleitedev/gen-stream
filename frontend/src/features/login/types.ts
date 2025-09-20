import { z } from "zod";
import type { loginSchema } from "./schemas";

export type LoginRequest = z.infer<typeof loginSchema>;

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
