import { createAuthClient } from "better-auth/react";

// Use environment variable for the base URL
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost/api";
const authUrl = import.meta.env.VITE_AUTH_URL || `${apiUrl}/auth`;

export const authClient = createAuthClient({
  baseURL: authUrl,
  credentials: "include",
});
