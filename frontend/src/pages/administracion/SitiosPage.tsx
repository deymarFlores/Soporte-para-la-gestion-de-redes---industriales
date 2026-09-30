import { useState } from "react";
import { useTopology } from "../../context/TopologyContext.js";
import { Modal } from "../../components/Modal.js";
import type { SitioInput } from "../../types/topology.js";

const EMPTY_FORM: SitioInput = { nombre: "", ubicacion: "", descripcion: "", habilitado: true };

function SitioForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: SitioInput;
  onSubmit: (data: SitioInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<SitioInput>(initial);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(form);
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <label className="field-label" htmlFor="nombre">
          Nombre
        </label>
        <input
          id="nombre"
          required
          className="input"
          value={form.nombre}
          onChange={(event) => setForm({ ...form, nombre: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="field-label" htmlFor="ubicacion">
          Ubicación
        </label>
        <input
          id="ubicacion"
          className="input"
          value={form.ubicacion}
          onChange={(event) => setForm({ ...form, ubicacion: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="field-label" htmlFor="descripcion">
          Descripción
        </label>
        <textarea
          id="descripcion"
          className="input"
          rows={2}
          value={form.descripcion}
          onChange={(event) => setForm({ ...form, descripcion: event.target.value })}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-muted">
        <input
          type="checkbox"
          checked={form.habilitado}
          onChange={(event) => setForm({ ...form, habilitado: event.target.checked })}
        />
        Sitio habilitado
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

export function SitiosPage() {
  const { sitios, equipos, createSitio, updateSitio, removeSitio } = useTopology();
  const [formOpen, setFormOpen] = useState<null | "create" | string>(null);

  const [actionError, setActionError] = useState<string | null>(null);
  const editingSitio = typeof formOpen === "string" ? sitios.find((sitio) => sitio.id === formOpen) : null;

  async function handleSubmit(data: SitioInput): Promise<void> {
    try {
      if (editingSitio) await updateSitio(editingSitio.id, data);
      else await createSitio(data);
      setActionError(null);
      setFormOpen(null);
    } catch (error) {
      setActionError((error as Error).message);
    }
  }

  async function handleToggleHabilitado(sitio: { id: string; habilitado: boolean }): Promise<void> {
    try {
      await updateSitio(sitio.id, { habilitado: !sitio.habilitado });
    } catch (error) {
      setActionError((error as Error).message);
    }
  }

  async function handleDelete(sitio: { id: string; nombre: string }): Promise<void> {
    if (equipoCount(sitio.id) > 0) {
      window.alert("No se puede eliminar un sitio con equipos asignados.");
      return;
    }
    if (!window.confirm(`¿Eliminar el sitio "${sitio.nombre}"?`)) return;
    try {
      await removeSitio(sitio.id);
    } catch (error) {
      setActionError((error as Error).message);
    }
  }

  function equipoCount(sitioId: string): number {
    return equipos.filter((equipo) => equipo.sitioId === sitioId).length;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Sitios</h1>
          <p className="page-subtitle">Instalaciones/plantas registradas</p>
        </div>
        <button type="button" onClick={() => setFormOpen("create")} className="btn btn-primary">
          Nuevo sitio
        </button>
      </div>

      {sitios.length === 0 ? (
        <div className="empty-state">No hay sitios registrados todavía.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Ubicación</th>
                <th className="px-4 py-3 font-medium">Equipos</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sitios.map((sitio) => (
                <tr key={sitio.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-ink">{sitio.nombre}</td>
                  <td className="px-4 py-3 text-ink-muted">{sitio.ubicacion || "—"}</td>
                  <td className="px-4 py-3 text-ink-muted">{equipoCount(sitio.id)}</td>
                  <td className="px-4 py-3 text-ink-muted">{sitio.habilitado ? "Habilitado" : "Deshabilitado"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setFormOpen(sitio.id)} className="text-xs text-accent hover:underline">
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleToggleHabilitado(sitio)}
                        className="text-xs text-ink-muted hover:underline"
                      >
                        {sitio.habilitado ? "Deshabilitar" : "Habilitar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(sitio)}
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

      {actionError && <div className="alert-danger">{actionError}</div>}

      {formOpen && (
        <Modal title={editingSitio ? "Editar sitio" : "Nuevo sitio"} onClose={() => setFormOpen(null)}>
          <SitioForm
            initial={
              editingSitio
                ? {
                    nombre: editingSitio.nombre,
                    ubicacion: editingSitio.ubicacion,
                    descripcion: editingSitio.descripcion,
                    habilitado: editingSitio.habilitado,
                  }
                : EMPTY_FORM
            }
            onSubmit={handleSubmit}
            onCancel={() => setFormOpen(null)}
          />
        </Modal>
      )}
    </div>
  );
}
