import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";

const ADMIN_LINKS = [
  { to: "/red", label: "Red" },
  { to: "/incidentes", label: "Incidentes" },
];

const ENGINEER_LINKS = [{ to: "/equipos", label: "Mis equipos" }];

export function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const links = user.role === "ADMIN" ? ADMIN_LINKS : ENGINEER_LINKS;

  return (
    <aside className="flex w-full shrink-0 flex-col border-border bg-surface-raised md:w-60 md:border-r">
      <div className="px-5 py-5">
        <span className="text-sm font-semibold text-ink">Soporte de Red</span>
        <p className="text-xs text-ink-muted">Industrial</p>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:pb-0">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors duration-200 ${
                isActive ? "bg-accent/15 text-accent" : "text-ink-muted hover:bg-surface hover:text-ink"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
