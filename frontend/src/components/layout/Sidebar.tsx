import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";
import { getNavigation, isNavGroup } from "../../config/navigation.js";

const linkClasses = ({ isActive }: { isActive: boolean }): string =>
  `whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors duration-200 ${
    isActive ? "bg-accent/15 text-accent" : "text-ink-muted hover:bg-surface hover:text-ink"
  }`;

export function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const navigation = getNavigation(user.role);

  return (
    <aside className="flex w-full shrink-0 flex-col border-border bg-surface-raised md:w-64 md:border-r">
      <div className="px-5 py-5">
        <span className="text-sm font-semibold text-ink">Soporte de Red</span>
        <p className="text-xs text-ink-muted">Industrial</p>
      </div>

      <nav className="flex flex-col gap-4 overflow-x-auto px-3 pb-4 md:overflow-visible">
        {navigation.map((entry) =>
          isNavGroup(entry) ? (
            <div key={entry.label} className="flex flex-col gap-1">
              <span className="px-3 text-xs font-medium uppercase tracking-wide text-ink-muted/70">
                {entry.label}
              </span>
              {entry.links.map((link) => (
                <NavLink key={link.to} to={link.to} end className={linkClasses}>
                  {link.label}
                </NavLink>
              ))}
            </div>
          ) : (
            <NavLink key={entry.to} to={entry.to} end className={linkClasses}>
              {entry.label}
            </NavLink>
          )
        )}
      </nav>
    </aside>
  );
}
