import { useAuth } from "../../context/AuthContext.js";
import { ThemeToggle } from "../ThemeToggle.js";
import type { Role } from "../../types/auth.js";

const ROLE_LABEL: Record<Role, string> = {
  ADMINISTRADOR: "Administrador",
  SOPORTE: "Soporte",
  CONSULTA: "Consulta",
};

export function Navbar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-6">
      <div>
        <p className="text-sm font-medium text-ink">{user.name}</p>
        <p className="text-xs text-ink-muted">{ROLE_LABEL[user.role]}</p>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button
          type="button"
          onClick={logout}
          className="btn btn-danger-outline"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
