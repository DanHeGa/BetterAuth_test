import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const currentDir = dirname(fileURLToPath(import.meta.url));
const serverRoot = resolve(currentDir, "..");

dotenv.config({ path: resolve(serverRoot, ".env") });

function required(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  authUrl: required("BETTER_AUTH_URL", "http://localhost:3000"),
  frontendUrl: required("FRONTEND_URL", "http://localhost:5173"),
  betterAuthSecret: required(
    "BETTER_AUTH_SECRET",
    "change-this-secret-before-production",
  ),
  databasePath: required("DATABASE_PATH", "./better-auth.sqlite"),
};
