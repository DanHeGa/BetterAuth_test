const API_URL = import.meta.env.VITE_API_URL?.trim() || "http://localhost:3000";

export async function fetchPrivateMessage() {
  const response = await fetch(`${API_URL}/api/private/report`, {
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo cargar el recurso protegido.");
  }

  return data as {
    message: string;
    sessionSummary: {
      userId: string;
      email: string;
      sessionId: string;
      expiresAt: string;
    };
  };
}

export async function fetchPrivateProfile () {
  const response = await fetch(`${API_URL}/api/private/profile`, {
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo cargar el perfil protegido");
  }

  return data as {
    message: string;
    userProfile: {
      name: string; 
      email: string; 
      id: string; 
      expiresAt: string;
    };
  };
}
