import type { Role } from "../types/auth.js";

export interface NavLink {
  label: string;
  to: string;
}

export interface NavGroup {
  label: string;
  links: NavLink[];
}

export type NavEntry = NavLink | NavGroup;

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return "links" in entry;
}

export function getNavigation(role: Role): NavEntry[] {
  const entries: NavEntry[] = [
    { label: "Dashboard", to: "/" },
    {
      label: "Monitoreo",
      links: [
        { label: "Topología", to: "/monitoreo/topologia" },
        { label: "Equipos", to: "/monitoreo/equipos" },
      ],
    },
    { label: "Incidentes", to: "/incidentes" },
    { label: "Análisis histórico", to: "/analisis-historico" },
  ];

  if (role === "ADMINISTRADOR" || role === "SOPORTE") {
    entries.push({
      label: "Acceso remoto",
      links: [
        { label: "Equipos disponibles", to: "/acceso-remoto/equipos" },
        { label: "Sesiones activas", to: "/acceso-remoto/sesiones" },
        { label: "Historial de accesos", to: "/acceso-remoto/historial" },
      ],
    });
  }

  if (role === "ADMINISTRADOR") {
    entries.push({
      label: "Administración",
      links: [
        { label: "Usuarios", to: "/administracion/usuarios" },
        { label: "Sitios", to: "/administracion/sitios" },
        { label: "Equipos", to: "/administracion/equipos" },
        { label: "Tramos", to: "/administracion/tramos" },
      ],
    });
  }

  return entries;
}
