import { useEffect, useState } from "react";
import { listUsers, createUser, updateUser, deleteUser, type UserInput } from "../../api/auth.js";
import { useTopology } from "../../context/TopologyContext.js";
import { Modal } from "../../components/Modal.js";
import type { AuthUser, Role } from "../../types/auth.js";

const ROLE_LABEL: Record<Role, string> = {
  ADMINISTRADOR: "Administrador",
  SOPORTE: "Soporte",
  CONSULTA: "Consulta",
};

function emptyForm(): UserInput {
  return { name: "", email: "", password: "", role: "CONSULTA", allowedDeviceIds: [], enabled: true };
}

function UserForm({
  initial,
  isEdit,
  equipoOptions,
  onSubmit,
  onCancel,
}: {
  initial: UserInput;
  isEdit: boolean;
  equipoOptions: { id: string; nombre: string }[];
  onSubmit: (data: UserInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<UserInput>(initial);

  function toggleDevice(id: string): void {
    setForm((prev) => ({
      ...prev,
      allowedDeviceIds: prev.allowedDeviceIds.includes(id)
        ? prev.allowedDeviceIds.filter((deviceId) => deviceId !== id)
        : [...prev.allowedDeviceIds, id],
    }));
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(form);
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <label className="field-label" htmlFor="name">
          Nombre
        </label>
        <input
          id="name"
          required
          className="input"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="field-label" htmlFor="email">
          Correo / usuario
        </label>
        <input
          id="email"
          type="email"
          required
          className="input"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="field-label" htmlFor="password">
          {isEdit ? "Nueva contraseña (dejar en blanco para no cambiarla)" : "Contraseña"}
        </label>
        <input
          id="password"
          type="text"
          required={!isEdit}
          className="input"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="field-label" htmlFor="role">
          Rol
        </label>
        <select
          id="role"
          className="input"
          value={form.role}
          onChange={(event) => setForm({ ...form, role: event.target.value as Role })}
        >
          <option value="ADMINISTRADOR">Administrador</option>
          <option value="SOPORTE">Soporte</option>
          <option value="CONSULTA">Consulta</option>
        </select>
      </div>

      {form.role !== "CONSULTA" && (
        <div className="flex flex-col gap-1.5">
          <span className="field-label">Equipos con acceso remoto autorizado</span>
          <div className="flex max-h-32 flex-col gap-1 overflow-y-auto rounded-md border border-border p-2">
            {equipoOptions.length === 0 ? (
              <span className="text-xs text-ink-muted">No hay equipos registrados todavía.</span>
            ) : (
              equipoOptions.map((equipo) => (
                <label key={equipo.id} className="flex items-center gap-2 text-sm text-ink-muted">
                  <input
                    type="checkbox"
                    checked={form.allowedDeviceIds.includes(equipo.id)}
                    onChange={() => toggleDevice(equipo.id)}
                  />
                  {equipo.nombre}
                </label>
              ))
            )}
          </div>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm text-ink-muted">
        <input
          type="checkbox"
          checked={form.enabled}
          onChange={(event) => setForm({ ...form, enabled: event.target.checked })}
        />
        Cuenta habilitada
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary">
          Guardar
        </button>
      </div>
    </form>
  );
}

export function UsuariosPage() {
  const { equipos } = useTopology();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState<null | "create" | string>(null);

  const equipoOptions = equipos.map((equipo) => ({ id: equipo.id, nombre: equipo.nombre }));
  const editingUser = typeof formOpen === "string" ? users.find((user) => user.id === formOpen) : null;

  async function refresh(): Promise<void> {
    try {
      const data = await listUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function handleSubmit(data: UserInput): Promise<void> {
    try {
      if (editingUser) {
        const { password, ...rest } = data;
        await updateUser(editingUser.id, password ? data : rest);
      } else {
        await createUser(data);
      }
      setActionError(null);
      setFormOpen(null);
      await refresh();
    } catch (err) {
      setActionError((err as Error).message);
    }
  }

  async function handleToggleEnabled(user: AuthUser): Promise<void> {
    try {
      await updateUser(user.id, { enabled: !user.enabled });
      await refresh();
    } catch (err) {
      setActionError((err as Error).message);
    }
  }

  async function handleDelete(user: AuthUser): Promise<void> {
    if (!window.confirm(`¿Eliminar a ${user.name}?`)) return;
    try {
      await deleteUser(user.id);
      await refresh();
    } catch (err) {
      setActionError((err as Error).message);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Usuarios</h1>
          <p className="page-subtitle">Cuentas y roles del sistema</p>
        </div>
        <button type="button" onClick={() => setFormOpen("create")} className="btn btn-primary">
          Nuevo usuario
        </button>
      </div>

      {actionError && <div className="alert-danger">{actionError}</div>}

      {loading ? (
        <p className="text-ink-muted">Cargando usuarios…</p>
      ) : error ? (
        <div className="alert-danger">No se pudo cargar la lista de usuarios: {error}</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Usuario / correo</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Último acceso</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-ink">{user.name}</td>
                  <td className="px-4 py-3 text-ink-muted">{user.email}</td>
                  <td className="px-4 py-3 text-ink-muted">{ROLE_LABEL[user.role]}</td>
                  <td className="px-4 py-3 text-ink-muted">{user.enabled ? "Habilitado" : "Deshabilitado"}</td>
                  <td className="px-4 py-3 text-xs text-ink-muted">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleString("es-BO", { dateStyle: "short", timeStyle: "short" })
                      : "Nunca"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setFormOpen(user.id)}
                        className="text-xs text-accent hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleToggleEnabled(user)}
                        className="text-xs text-ink-muted hover:underline"
                      >
                        {user.enabled ? "Deshabilitar" : "Habilitar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(user)}
                        className="text-xs text-status-down hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <Modal title={editingUser ? "Editar usuario" : "Nuevo usuario"} onClose={() => setFormOpen(null)}>
          <UserForm
            initial={
              editingUser
                ? {
                    name: editingUser.name,
                    email: editingUser.email,
                    password: "",
                    role: editingUser.role,
                    allowedDeviceIds: editingUser.allowedDeviceIds,
                    enabled: editingUser.enabled,
                  }
                : emptyForm()
            }
            isEdit={Boolean(editingUser)}
            equipoOptions={equipoOptions}
            onSubmit={(data) => void handleSubmit(data)}
            onCancel={() => setFormOpen(null)}
          />
        </Modal>
      )}
    </div>
  );
}
