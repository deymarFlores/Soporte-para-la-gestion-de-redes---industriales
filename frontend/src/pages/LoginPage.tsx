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
      <div className="card w-full max-w-sm p-8">
        <h1 className="text-lg font-semibold text-ink">Soporte de Red Industrial</h1>
        <p className="mt-1 page-subtitle">Inicia sesión para continuar</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="field-label">
              Correo
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="field-label">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-status-down">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary mt-2">
            Entrar
          </button>
        </form>

        <div className="mt-6 border-t border-border pt-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-ink-muted">Acceso de demostración</p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => loginAs("admin@planta.com", "admin123")}
              className="btn btn-secondary justify-start"
            >
              Entrar como Administrador
            </button>
            <button
              type="button"
              onClick={() => loginAs("ingeniero@planta.com", "ing123")}
              className="btn btn-secondary justify-start"
            >
              Entrar como Ingeniero
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
