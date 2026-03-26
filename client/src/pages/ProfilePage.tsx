import { useEffect, useState } from "react";
import { fetchPrivateProfile } from "../lib/api";
import { authClient } from "../lib/auth-client";

type PrivateState =
  | { status: "idle" | "loading" }
  | { status: "success"; data: Awaited<ReturnType<typeof fetchPrivateProfile>> }
  | { status: "error"; message: string };

export function ProfilePage(){
    const{ data: session } = authClient.useSession();
    const [privateState, setPrivateState] = useState<PrivateState>({
        status: "idle"
    });

    useEffect(() => {
        void loadPrivateResource();
    }, []);

    async function loadPrivateResource() {
        setPrivateState({ status: "loading" });

        try {
            const data = await fetchPrivateProfile();
            setPrivateState({ 
                status: "success", 
                data
            });
        } catch(error) {
            setPrivateState({
                status: "error",
                message:
                error instanceof Error ? error.message : "No se pudo leer la ruta protegida con info del usuario.",
            });
        }
    }

    if (!session) {
        return null;
    }

    return (
        <>
            <div>
                <article className="card">
                    <h2>Página de usuario</h2>
                    {privateState.status === "loading" ? <p> Cargando recurso protegido... </p> : null}
                    {privateState.status === "error" ? (
                        <p className="notice error">{privateState.message}</p>
                    ): null}
                    {privateState.status === "success" ? (
                        <>
                            <article className="card" >
                                <p>
                                    <strong>Nombre:</strong> {privateState.data.userProfile.name}
                                </p>
                                <p>
                                    <strong>Correo:</strong> {privateState.data.userProfile.email}
                                </p>
                                <p>
                                    <strong>Identificador:</strong> {privateState.data.userProfile.id}
                                </p>
                                <p>
                                    <strong>Expira en:</strong> {privateState.data.userProfile.expiresAt}
                                </p>
                            </article>
                        </>
                    ): null}
                </article>
            </div>
        </>
    )
}
