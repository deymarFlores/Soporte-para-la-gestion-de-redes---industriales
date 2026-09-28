import { useEffect, useState } from "react";

type Theme = "dark" | "light";

function getInitialTheme(): Theme {
  try {
    return window.localStorage.getItem("theme") === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem("theme", theme);
    } catch {
      // almacenamiento no disponible (ej. modo privado); no afecta el funcionamiento
    }
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      className="rounded-md border border-border px-3 py-1.5 text-sm text-ink-muted transition-colors duration-200 hover:border-accent hover:text-ink"
    >
      {theme === "dark" ? "Modo claro" : "Modo oscuro"}
    </button>
  );
}
