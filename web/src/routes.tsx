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
};

const routes: AppRoute[] = [
  { path: "/", Component: HomePage },
  { path: "/socios", Component: MembersPage },
  { path: "/cuotas", Component: DuesPage },
  { path: "/pagos", Component: PaymentsPage },
  { path: "/reportes", Component: ReportsPage },
  { path: "/register", Component: RegisterPage, layout: "plain" },
  { path: "/admin/create-user", Component: AdminCreateUser },
  { path: "/login", Component: LoginPage, layout: "plain" },
];

export default routes;
