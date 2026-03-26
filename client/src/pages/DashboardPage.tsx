import { useEffect, useState } from "react";
import { authClient } from "../lib/auth-client";
import { fetchPrivateMessage } from "../lib/api";

type PrivateState =
  | { status: "idle" | "loading" }
  | { status: "success"; data: Awaited<ReturnType<typeof fetchPrivateMessage>> }
  | { status: "error"; message: string };

export function DashboardPage() {
  const { data: session, refetch } = authClient.useSession();
  const [privateState, setPrivateState] = useState<PrivateState>({
    status: "idle",
  });
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    void loadPrivateResource();
  }, []);

  async function loadPrivateResource() {
    setPrivateState({ status: "loading" });

    try {
      const data = await fetchPrivateMessage();
      setPrivateState({ status: "success", data });
    } catch (error) {
      setPrivateState({
        status: "error",
        message:
          error instanceof Error ? error.message : "No se pudo leer la ruta protegida.",
      });
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    await authClient.signOut();
    await refetch();
    setIsSigningOut(false);
    setPrivateState({ status: "idle" });
  }

  if (!session) {
    return null;
  }

  return (
    <section className="stack-lg">
      <div className="grid">
        <article className="card">
          <h2>Sesion actual</h2>
          <p>
            <strong>Usuario:</strong> {session.user.name}
          </p>
          <p>
            <strong>Correo:</strong> {session.user.email}
          </p>
          <p>
            <strong>ID de sesion:</strong> {session.session.id}
          </p>
          <p>
            <strong>Expira:</strong>{" "}
            {new Date(session.session.expiresAt).toLocaleString("es-MX")}
          </p>
          <button className="secondary" disabled={isSigningOut} onClick={handleSignOut}>
            {isSigningOut ? "Cerrando..." : "Cerrar sesion"}
          </button>
        </article>

        <article className="card accent">
          <h2>Recurso protegido</h2>
          <p>
            Esta tarjeta hace <code>fetch</code> con <code>credentials:
            "include"</code> a una ruta de Express que solo responde si Better
            Auth encuentra una sesion valida en la cookie.
          </p>
          <button className="ghost" onClick={() => void loadPrivateResource()}>
            Volver a consultar
          </button>
        </article>
      </div>

      <article className="card">
        <h2>Respuesta del backend</h2>
        {privateState.status === "loading" ? <p>Cargando recurso protegido...</p> : null}
        {privateState.status === "error" ? (
          <p className="notice error">{privateState.message}</p>
        ) : null}
        {privateState.status === "success" ? (
          <pre>{JSON.stringify(privateState.data, null, 2)}</pre>
        ) : null}
      </article>
    </section>
  );
}
