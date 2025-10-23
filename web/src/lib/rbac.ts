export const ROLES = ["admin", "contador", "operador", "socio"] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador",
  contador: "Contador",
  operador: "Operador",
  socio: "Socio",
};

export const rolePriority: Record<Role, number> = {
  admin: 4,
  contador: 3,
  operador: 2,
  socio: 1,
};

export function can(role: Role, action: "manage_payments" | "read_reports" | "manage_members") {
  switch (action) {
    case "manage_payments":
      return role === "admin" || role === "contador";
    case "manage_members":
      return role === "admin" || role === "operador";
    case "read_reports":
      return role !== "socio";
    default:
      return false;
  }
}
