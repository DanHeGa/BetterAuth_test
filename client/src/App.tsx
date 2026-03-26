import { Navigate, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { authClient } from "./lib/auth-client";
import { HomePage } from "./pages/HomePage";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RequireAuth } from "./components/require-auth";

function SessionBadge() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <span className="badge">Sesion: cargando</span>;
  }

  if (!session) {
    return <span className="badge">Sesion: invitado</span>;
  }

  return <span className="badge">Sesion activa: {session.user.email}</span>;
}

export default function App() {
  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Laboratorio guiado</p>
          <h1>Autenticacion con Better Auth en Vite + React + TypeScript</h1>
          <p className="hero-copy">
            El ejemplo enseña registro, login, persistencia de sesion por cookies,
            cierre de sesion y consumo de una ruta protegida desde un frontend y
            backend separados.
          </p>
        </div>
        <SessionBadge />
      </header>

      <nav className="nav">
        <NavLink to="/">Inicio</NavLink>
        <NavLink to="/auth">Auth</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/profile">Profile</NavLink>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<DashboardPage />}/>
            <Route path="/profile" element={<ProfilePage />}/>
          </Route>
        </Routes>
      </main>
    </div>
  );
}
