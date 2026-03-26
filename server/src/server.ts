import express from "express";
import cors from "cors";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import { env } from "./env.js";

const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    message: "Servidor de autenticacion listo",
    frontendOrigin: env.frontendUrl,
  });
});

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());

app.get("/api/session", async (request, response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  response.json(session);
});

app.get("/api/private/report", async (request, response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  if (!session) {
    response.status(401).json({
      message: "No hay sesion valida. La ruta protegida requiere autenticacion.",
    });
    return;
  }

  response.json({
    message:
      "La cookie de sesion llego correctamente y Better Auth autorizo el acceso.",
    sessionSummary: {
      userId: session.user.id,
      email: session.user.email,
      sessionId: session.session.id,
      expiresAt: session.session.expiresAt,
    },
  });
});

app.get("/api/private/profile", async (request, response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  if (!session) {
    response.status(401).json({
      message: "No hay sesión válida.",
    });
    return;
  }

  response.json({
    message: 
      "La cookie de sesion llego correctamente y Better Auth autorizo el acceso.",
    userProfile: {
      name: session.user.name,
      email: session.user.email,
      id: session.user.id,
      expiresAt: session.session.expiresAt
    },
  });
});

app.listen(env.port, () => {
  console.log(`Better Auth server running on ${env.authUrl}`);
  console.log(`Trusted frontend origin: ${env.frontendUrl}`);
});
