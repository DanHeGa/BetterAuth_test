import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authClient } from "../lib/auth-client";


export function RequireAuth({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <p className="status">Validando sesion...</p>;
  }

  if (!session) {
    return <Navigate replace to="/auth" state={{ from: location.pathname }} />;
  }

  return children ? <>{children}</> : <Outlet />;
}
