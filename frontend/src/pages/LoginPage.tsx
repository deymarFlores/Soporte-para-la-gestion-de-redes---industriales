import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (user) {
    const redirectTo = (location.state as { from?: string } | null)?.from ?? "/";
    return <Navigate to={redirectTo} replace />;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const success = login(email, password);
    if (!success) {
      setError("Correo o contraseña incorrectos");
      return;
    }
    setError(null);
    navigate("/", { replace: true });
  }

  function loginAs(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    const success = login(demoEmail, demoPassword);
    if (success) navigate("/", { replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface-raised p-8">
        <h1 className="text-lg font-semibold text-ink">Soporte de Red Industrial</h1>
        <p className="mt-1 text-sm text-ink-muted">Inicia sesión para continuar</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm text-ink-muted">
              Correo
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-200 focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm text-ink-muted">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors duration-200 focus:border-accent"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-status-down">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-surface transition-colors duration-200 hover:bg-accent-strong active:scale-[0.98]"
          >
            Entrar
          </button>
        </form>

        <div className="mt-6 border-t border-border pt-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-ink-muted">Acceso de demostración</p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => loginAs("admin@planta.com", "admin123")}
              className="rounded-md border border-border px-3 py-2 text-left text-sm text-ink-muted transition-colors duration-200 hover:border-accent hover:text-ink"
            >
              Entrar como Administrador
            </button>
            <button
              type="button"
              onClick={() => loginAs("ingeniero@planta.com", "ing123")}
              className="rounded-md border border-border px-3 py-2 text-left text-sm text-ink-muted transition-colors duration-200 hover:border-accent hover:text-ink"
            >
              Entrar como Ingeniero
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
