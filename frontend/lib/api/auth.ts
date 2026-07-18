import { apiRequest } from "./http";
import type { User } from "@/types";

export interface AuthPayload {
  token: string;
  user: User;
}

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 */
export function register(payload: {
  name: string;
  email: string;
  password: string;
}) {
  return apiRequest<AuthPayload>({
    url: "/auth/register",
    method: "POST",
    data: payload,
  });
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export function login(payload: { email: string; password: string }) {
  return apiRequest<AuthPayload>({
    url: "/auth/login",
    method: "POST",
    data: payload,
  });
}

/**
 * GET /api/auth/me
 * Returns the currently-authenticated user (validated JWT).
 */
export function me() {
  return apiRequest<{ user: User }>({
    url: "/auth/me",
    method: "GET",
  });
}