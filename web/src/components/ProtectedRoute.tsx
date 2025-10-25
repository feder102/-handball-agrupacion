import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { Loader } from "./Loader";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

/**
 * ProtectedRoute Component
 * 
 * Protege rutas que requieren autenticación.
 * Si el usuario NO está autenticado, redirige a /login.
 * Mientras carga la sesión, muestra un loader.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, isLoading } = useAuthenticatedUser();
  const location = useLocation();

  // Mientras carga la sesión, mostrar loader
  if (isLoading) {
    return <Loader />;
  }

  // Si no hay sesión, redirigir a login (preservando la ruta intentada)
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Usuario autenticado: renderizar la ruta
  return <>{children}</>;
}
