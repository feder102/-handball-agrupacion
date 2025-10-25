import { lazy } from "react";
import type { ComponentType } from "react";

const HomePage = lazy(() => import("./pages/Home"));
const MembersPage = lazy(() => import("./pages/Members"));
const DuesPage = lazy(() => import("./pages/Dues"));
const PaymentsPage = lazy(() => import("./pages/Payments"));
const ReportsPage = lazy(() => import("./pages/Reports"));
const RegisterPage = lazy(() => import("./pages/Register"));
const LoginPage = lazy(() => import("./pages/Login"));
const AdminCreateUser = lazy(() => import("./pages/AdminCreateUser"));

export type AppRoute = {
  path: string;
  Component: ComponentType;
  layout?: "default" | "plain";
  protected?: boolean;
};

const routes: AppRoute[] = [
  // Rutas públicas
  { path: "/", Component: LoginPage, layout: "plain" },
  { path: "/login", Component: LoginPage, layout: "plain" },
  { path: "/register", Component: RegisterPage, layout: "plain" },
  
  // Rutas protegidas (requieren autenticación)
  { path: "/dashboard", Component: HomePage, protected: true },
  { path: "/socios", Component: MembersPage, protected: true },
  { path: "/cuotas", Component: DuesPage, protected: true },
  { path: "/pagos", Component: PaymentsPage, protected: true },
  { path: "/reportes", Component: ReportsPage, protected: true },
  { path: "/admin/create-user", Component: AdminCreateUser, protected: true },
];

export default routes;
