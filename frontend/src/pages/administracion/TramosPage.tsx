import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.js";
import { useTopology } from "../../context/TopologyContext.js";
import { canManageInfrastructure } from "../../types/auth.js";
import { Modal } from "../../components/Modal.js";
import type { TramoInput, TramoView } from "../../types/topology.js";

const EMPTY_FORM: TramoInput = {
  nombre: "",
  origenEquipoId: "",
  destinoEquipoId: "",
  tipoConexion: "Ethernet",
  metodoMonitoreo: "ICMP",
  intervaloComprobacionSegundos: 30,
  umbralLatenciaMs: 200,
  umbralPerdidaPct: 5,
  habilitado: true,
};

function TramoForm({
  initial,
  equipoOptions,
  onSubmit,
  onCancel,
}: {
  initial: TramoInput;
  equipoOptions: { id: string; nombre: string }[];
  onSubmit: (data: TramoInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<TramoInput>(initial);

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

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="field-label" htmlFor="origen">
            Origen
          </label>
          <select
            id="origen"
            required
            className="input"
            value={form.origenEquipoId}
            onChange={(event) => setForm({ ...form, origenEquipoId: event.target.value })}
          >
            <option value="" disabled>
              Selecciona un equipo
            </option>
            {equipoOptions.map((equipo) => (
              <option key={equipo.id} value={equipo.id}>
                {equipo.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="field-label" htmlFor="destino">
            Destino
          </label>
          <select
            id="destino"
            required
            className="input"
            value={form.destinoEquipoId}
            onChange={(event) => setForm({ ...form, destinoEquipoId: event.target.value })}
          >
            <option value="" disabled>
              Selecciona un equipo
            </option>
            {equipoOptions.map((equipo) => (
              <option key={equipo.id} value={equipo.id}>
                {equipo.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="field-label" htmlFor="tipoConexion">
          Tipo de conexión
        </label>
        <input
          id="tipoConexion"
          className="input"
          value={form.tipoConexion}
          onChange={(event) => setForm({ ...form, tipoConexion: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="field-label" htmlFor="metodoMonitoreo">
          Método de monitoreo
        </label>
        <input
          id="metodoMonitoreo"
          className="input"
          value={form.metodoMonitoreo}
          onChange={(event) => setForm({ ...form, metodoMonitoreo: event.target.value })}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="field-label" htmlFor="intervalo">
            Intervalo (s)
          </label>
          <input
            id="intervalo"
            type="number"
            min={5}
            className="input"
            value={form.intervaloComprobacionSegundos}
            onChange={(event) => setForm({ ...form, intervaloComprobacionSegundos: Number(event.target.value) })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="field-label" htmlFor="umbralLatencia">
            Umbral latencia (ms)
          </label>
          <input
            id="umbralLatencia"
            type="number"
            min={0}
            className="input"
            value={form.umbralLatenciaMs}
            onChange={(event) => setForm({ ...form, umbralLatenciaMs: Number(event.target.value) })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="field-label" htmlFor="umbralPerdida">
            Umbral pérdida (%)
          </label>
          <input
            id="umbralPerdida"
            type="number"
            min={0}
            max={100}
            className="input"
            value={form.umbralPerdidaPct}
            onChange={(event) => setForm({ ...form, umbralPerdidaPct: Number(event.target.value) })}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-muted">
        <input
          type="checkbox"
          checked={form.habilitado}
          onChange={(event) => setForm({ ...form, habilitado: event.target.checked })}
        />
        Tramo habilitado (monitoreo activo)
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

export function TramosPage() {
  const { user } = useAuth();
  const { equipos, tramos, createTramo, updateTramo, removeTramo } = useTopology();
  const canManage = user !== null && canManageInfrastructure(user.role);

  const [formOpen, setFormOpen] = useState<null | "create" | string>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const equipoOptions = useMemo(() => equipos.map((equipo) => ({ id: equipo.id, nombre: equipo.nombre })), [equipos]);
  const editingTramo = typeof formOpen === "string" ? tramos.find((tramo) => tramo.id === formOpen) : null;

  async function handleSubmit(data: TramoInput): Promise<void> {
    try {
      if (editingTramo) await updateTramo(editingTramo.id, data);
      else await createTramo(data);
      setActionError(null);
      setFormOpen(null);
    } catch (error) {
      setActionError((error as Error).message);
    }
  }

  async function handleToggleHabilitado(tramo: TramoView): Promise<void> {
    try {
      await updateTramo(tramo.id, { habilitado: !tramo.habilitado });
    } catch (error) {
      setActionError((error as Error).message);
    }
  }

  async function handleDelete(tramo: TramoView): Promise<void> {
    if (!window.confirm(`¿Eliminar el tramo "${tramo.nombre}"?`)) return;
    try {
      await removeTramo(tramo.id);
    } catch (error) {
      setActionError((error as Error).message);
    }
  }

  function ultimaComprobacion(tramo: TramoView): string {
    const destino = equipos.find((equipo) => equipo.id === tramo.destinoEquipoId);
    return destino?.ultimaComprobacion
      ? new Date(destino.ultimaComprobacion).toLocaleString("es-BO", { dateStyle: "short", timeStyle: "short" })
      : "—";
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Tramos</h1>
          <p className="page-subtitle">Segmentos que forman el enlace, con su configuración de monitoreo</p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => setFormOpen("create")}
            className="btn btn-primary"
            disabled={equipoOptions.length < 2}
            title={equipoOptions.length < 2 ? "Se necesitan al menos dos equipos registrados" : undefined}
          >
            Nuevo tramo
          </button>
        )}
      </div>

      {tramos.length === 0 ? (
        <div className="empty-state">No hay tramos registrados todavía.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Origen</th>
                <th className="px-4 py-3 font-medium">Destino</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Última comprobación</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tramos.map((tramo) => (
                <tr key={tramo.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-ink">{tramo.nombre}</td>
                  <td className="px-4 py-3 text-ink-muted">{tramo.origenNombre}</td>
                  <td className="px-4 py-3 text-ink-muted">{tramo.destinoNombre}</td>
                  <td className="px-4 py-3 text-ink-muted">{tramo.tipoConexion}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs ${
                        tramo.estado === "UP"
                          ? "text-status-up"
                          : tramo.estado === "DOWN"
                            ? "text-status-down"
                            : "text-ink-muted"
                      }`}
                    >
                      <span
                        className={`status-dot h-1.5 w-1.5 ${
                          tramo.estado === "UP" ? "bg-status-up" : tramo.estado === "DOWN" ? "bg-status-down" : "bg-status-unknown"
                        }`}
                      />
                      {tramo.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-muted">{ultimaComprobacion(tramo)}</td>
                  <td className="px-4 py-3">
                    {canManage ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setFormOpen(tramo.id)}
                          className="text-xs text-accent hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleToggleHabilitado(tramo)}
                          className="text-xs text-ink-muted hover:underline"
                        >
                          {tramo.habilitado ? "Deshabilitar" : "Habilitar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(tramo)}
                          className="text-xs text-status-down hover:underline"
                        >
                          Eliminar
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-ink-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {actionError && <div className="alert-danger">{actionError}</div>}

      {formOpen && (
        <Modal title={editingTramo ? "Editar tramo" : "Nuevo tramo"} onClose={() => setFormOpen(null)}>
          <TramoForm
            initial={
              editingTramo
                ? {
                    nombre: editingTramo.nombre,
                    origenEquipoId: editingTramo.origenEquipoId,
                    destinoEquipoId: editingTramo.destinoEquipoId,
                    tipoConexion: editingTramo.tipoConexion,
                    metodoMonitoreo: editingTramo.metodoMonitoreo,
                    intervaloComprobacionSegundos: editingTramo.intervaloComprobacionSegundos,
                    umbralLatenciaMs: editingTramo.umbralLatenciaMs,
                    umbralPerdidaPct: editingTramo.umbralPerdidaPct,
                    habilitado: editingTramo.habilitado,
                  }
                : EMPTY_FORM
            }
            equipoOptions={equipoOptions}
            onSubmit={handleSubmit}
            onCancel={() => setFormOpen(null)}
          />
        </Modal>
      )}
    </div>
  );
}
