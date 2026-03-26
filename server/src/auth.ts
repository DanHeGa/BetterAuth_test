import { betterAuth } from "better-auth";
import { db } from "./db.js";
import { env } from "./env.js";

export const auth = betterAuth({
  appName: "Better Auth Lab",
  baseURL: env.authUrl,
  secret: env.betterAuthSecret,
  database: db,
  trustedOrigins: [env.frontendUrl],
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});
