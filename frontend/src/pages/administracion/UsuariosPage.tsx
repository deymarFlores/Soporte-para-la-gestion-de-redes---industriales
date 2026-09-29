import { useState } from "react";
import { useUsers, type UserInput } from "../../context/UsersContext.js";
import { Modal } from "../../components/Modal.js";
import type { Role } from "../../types/auth.js";

const ROLE_LABEL: Record<Role, string> = {
  ADMINISTRADOR: "Administrador",
  SOPORTE: "Soporte",
  CONSULTA: "Consulta",
};

function emptyForm(): UserInput {
  return { name: "", email: "", password: "", role: "CONSULTA", allowedDeviceIps: [], habilitado: true };
}

function UserForm({
  initial,
  isEdit,
  onSubmit,
  onCancel,
}: {
  initial: UserInput;
  isEdit: boolean;
  onSubmit: (data: UserInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<UserInput>(initial);

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
          {isEdit ? "Nueva contraseña (dejar igual para no cambiarla)" : "Contraseña"}
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

      <label className="flex items-center gap-2 text-sm text-ink-muted">
        <input
          type="checkbox"
          checked={form.habilitado}
          onChange={(event) => setForm({ ...form, habilitado: event.target.checked })}
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
  const { users, createUser, updateUser, removeUser } = useUsers();
  const [formOpen, setFormOpen] = useState<null | "create" | string>(null);

  const editingUser = typeof formOpen === "string" ? users.find((user) => user.id === formOpen) : null;

  function handleSubmit(data: UserInput): void {
    if (editingUser) {
      const { password, ...rest } = data;
      updateUser(editingUser.id, password ? data : rest);
    } else {
      createUser(data);
    }
    setFormOpen(null);
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
                <td className="px-4 py-3 text-ink-muted">{user.habilitado ? "Habilitado" : "Deshabilitado"}</td>
                <td className="px-4 py-3 text-xs text-ink-muted">
                  {user.ultimoAcceso
                    ? new Date(user.ultimoAcceso).toLocaleString("es-BO", { dateStyle: "short", timeStyle: "short" })
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
                      onClick={() => updateUser(user.id, { habilitado: !user.habilitado })}
                      className="text-xs text-ink-muted hover:underline"
                    >
                      {user.habilitado ? "Deshabilitar" : "Habilitar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`¿Eliminar a ${user.name}?`)) removeUser(user.id);
                      }}
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
                    allowedDeviceIps: editingUser.allowedDeviceIps,
                    habilitado: editingUser.habilitado,
                  }
                : emptyForm()
            }
            isEdit={Boolean(editingUser)}
            onSubmit={handleSubmit}
            onCancel={() => setFormOpen(null)}
          />
        </Modal>
      )}
    </div>
  );
}
