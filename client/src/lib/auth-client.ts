import { createAuthClient } from "better-auth/react";

const baseURL =
  import.meta.env.VITE_AUTH_URL?.trim() || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL,
});
