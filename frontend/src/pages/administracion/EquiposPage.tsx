import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.js";
import { useTopology } from "../../context/TopologyContext.js";
import { canManageInfrastructure } from "../../types/auth.js";
import { Modal } from "../../components/Modal.js";
import { StatusBadge } from "../../components/StatusBadge.js";
import type { EquipoInput, EquipoView, SitioRecord } from "../../types/topology.js";
import type { NodeType } from "../../types/monitoring.js";

const TIPO_LABEL: Record<NodeType, string> = {
  GATEWAY: "Gateway",
  PLC: "PLC",
  DEVICE: "Dispositivo",
};

function emptyForm(defaultSitioId: string): EquipoInput {
  return {
    nombre: "",
    tipo: "DEVICE",
    ip: "",
    sitioId: defaultSitioId,
    descripcion: "",
    parametrosMonitoreo: "ICMP cada 30s",
    habilitado: true,
    accesoRemotoHabilitado: false,
  };
}

function EquipoForm({
  initial,
  sitios,
  onSubmit,
  onCancel,
}: {
  initial: EquipoInput;
  sitios: SitioRecord[];
  onSubmit: (data: EquipoInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<EquipoInput>(initial);

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
        <label className="field-label" htmlFor="tipo">
          Tipo
        </label>
        <select
          id="tipo"
          className="input"
          value={form.tipo}
          onChange={(event) => setForm({ ...form, tipo: event.target.value as NodeType })}
        >
          <option value="GATEWAY">Gateway</option>
          <option value="PLC">PLC</option>
          <option value="DEVICE">Dispositivo</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="field-label" htmlFor="ip">
          IP / host
        </label>
        <input
          id="ip"
          required
          className="input font-mono"
          value={form.ip}
          onChange={(event) => setForm({ ...form, ip: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="field-label" htmlFor="sitio">
          Sitio
        </label>
        <select
          id="sitio"
          required
          className="input"
          value={form.sitioId}
          onChange={(event) => setForm({ ...form, sitioId: event.target.value })}
        >
          {sitios.map((sitio) => (
            <option key={sitio.id} value={sitio.id}>
              {sitio.nombre}
            </option>
          ))}
        </select>
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

      <div className="flex flex-col gap-1.5">
        <label className="field-label" htmlFor="parametrosMonitoreo">
          Parámetros de monitoreo
        </label>
        <input
          id="parametrosMonitoreo"
          className="input"
          value={form.parametrosMonitoreo}
          onChange={(event) => setForm({ ...form, parametrosMonitoreo: event.target.value })}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-muted">
        <input
          type="checkbox"
          checked={form.accesoRemotoHabilitado}
          onChange={(event) => setForm({ ...form, accesoRemotoHabilitado: event.target.checked })}
        />
        Habilitado para acceso remoto
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

export function EquiposPage({ readOnly = false }: { readOnly?: boolean }) {
  const { user } = useAuth();
  const { equipos, sitios, activeIncidents, createEquipo, updateEquipo, removeEquipo } = useTopology();
  const canManage = !readOnly && user !== null && canManageInfrastructure(user.role);

  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState<"" | NodeType>("");
  const [sitioFilter, setSitioFilter] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");

  const [formOpen, setFormOpen] = useState<null | "create" | string>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return equipos.filter((equipo) => {
      const matchesSearch =
        search.trim() === "" ||
        equipo.nombre.toLowerCase().includes(search.toLowerCase()) ||
        equipo.ip.toLowerCase().includes(search.toLowerCase());
      const matchesTipo = tipoFilter === "" || equipo.tipo === tipoFilter;
      const matchesSitio = sitioFilter === "" || equipo.sitioId === sitioFilter;
      const matchesEstado = estadoFilter === "" || equipo.estado === estadoFilter;
      return matchesSearch && matchesTipo && matchesSitio && matchesEstado;
    });
  }, [equipos, search, tipoFilter, sitioFilter, estadoFilter]);

  const editingEquipo = typeof formOpen === "string" ? equipos.find((equipo) => equipo.id === formOpen) : null;
  const detailEquipo = detailId ? equipos.find((equipo) => equipo.id === detailId) : null;

  function handleSubmit(data: EquipoInput): void {
    if (editingEquipo) updateEquipo(editingEquipo.id, data);
    else createEquipo(data);
    setFormOpen(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Equipos</h1>
          <p className="page-subtitle">Equipos registrados en la infraestructura</p>
        </div>
        {canManage && (
          <button type="button" onClick={() => setFormOpen("create")} className="btn btn-primary">
            Nuevo equipo
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          placeholder="Buscar por nombre o IP"
          className="input w-56"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select className="input w-40" value={tipoFilter} onChange={(event) => setTipoFilter(event.target.value as "" | NodeType)}>
          <option value="">Todos los tipos</option>
          <option value="GATEWAY">Gateway</option>
          <option value="PLC">PLC</option>
          <option value="DEVICE">Dispositivo</option>
        </select>
        <select className="input w-40" value={sitioFilter} onChange={(event) => setSitioFilter(event.target.value)}>
          <option value="">Todos los sitios</option>
          {sitios.map((sitio) => (
            <option key={sitio.id} value={sitio.id}>
              {sitio.nombre}
            </option>
          ))}
        </select>
        <select className="input w-40" value={estadoFilter} onChange={(event) => setEstadoFilter(event.target.value)}>
          <option value="">Todos los estados</option>
          <option value="UP">Disponible</option>
          <option value="DOWN">Caído</option>
          <option value="UNKNOWN">Sin datos</option>
          <option value="SIN_MONITOREO">Sin monitoreo</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No hay equipos que coincidan con los filtros.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">IP</th>
                <th className="px-4 py-3 font-medium">Sitio</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Última comprobación</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((equipo) => (
                <tr key={equipo.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-ink">{equipo.nombre}</td>
                  <td className="px-4 py-3 text-ink-muted">{TIPO_LABEL[equipo.tipo]}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-muted">{equipo.ip}</td>
                  <td className="px-4 py-3 text-ink-muted">{equipo.sitioNombre}</td>
                  <td className="px-4 py-3">
                    {equipo.estado === "SIN_MONITOREO" ? (
                      <span className="text-xs text-ink-muted">Sin monitoreo</span>
                    ) : (
                      <StatusBadge status={equipo.estado} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-muted">
                    {equipo.ultimaComprobacion
                      ? new Date(equipo.ultimaComprobacion).toLocaleString("es-BO", { dateStyle: "short", timeStyle: "short" })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setDetailId(equipo.id)} className="text-xs text-accent hover:underline">
                        Ver detalle
                      </button>
                      {canManage && (
                        <>
                          <button
                            type="button"
                            onClick={() => setFormOpen(equipo.id)}
                            className="text-xs text-accent hover:underline"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => updateEquipo(equipo.id, { habilitado: !equipo.habilitado })}
                            className="text-xs text-ink-muted hover:underline"
                          >
                            {equipo.habilitado ? "Deshabilitar" : "Habilitar"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`¿Eliminar ${equipo.nombre}?`)) removeEquipo(equipo.id);
                            }}
                            className="text-xs text-status-down hover:underline"
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <Modal title={editingEquipo ? "Editar equipo" : "Nuevo equipo"} onClose={() => setFormOpen(null)}>
          <EquipoForm
            initial={
              editingEquipo
                ? {
                    nombre: editingEquipo.nombre,
                    tipo: editingEquipo.tipo,
                    ip: editingEquipo.ip,
                    sitioId: editingEquipo.sitioId,
                    descripcion: editingEquipo.descripcion,
                    parametrosMonitoreo: editingEquipo.parametrosMonitoreo,
                    habilitado: editingEquipo.habilitado,
                    accesoRemotoHabilitado: editingEquipo.accesoRemotoHabilitado,
                  }
                : emptyForm(sitios[0]?.id ?? "")
            }
            sitios={sitios}
            onSubmit={handleSubmit}
            onCancel={() => setFormOpen(null)}
          />
        </Modal>
      )}

      {detailEquipo && (
        <Modal title={detailEquipo.nombre} onClose={() => setDetailId(null)}>
          <EquipoDetail equipo={detailEquipo} incidentCount={activeIncidents.filter((i) => i.nodeId === detailEquipo.id).length} />
        </Modal>
      )}
    </div>
  );
}

function EquipoDetail({ equipo, incidentCount }: { equipo: EquipoView; incidentCount: number }) {
  return (
    <dl className="flex flex-col gap-3 text-sm">
      {(
        [
          ["Tipo", TIPO_LABEL[equipo.tipo]],
          ["IP / host", equipo.ip],
          ["Sitio", equipo.sitioNombre],
          ["Estado", equipo.estado === "SIN_MONITOREO" ? "Sin monitoreo" : equipo.estado],
          [
            "Última comprobación",
            equipo.ultimaComprobacion
              ? new Date(equipo.ultimaComprobacion).toLocaleString("es-BO", { dateStyle: "short", timeStyle: "medium" })
              : "—",
          ],
          ["Descripción", equipo.descripcion || "—"],
          ["Parámetros de monitoreo", equipo.parametrosMonitoreo || "—"],
          ["Incidentes activos asociados", String(incidentCount)],
        ] as [string, string][]
      ).map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 border-b border-border pb-2 last:border-0">
          <dt className="text-ink-muted">{label}</dt>
          <dd className="text-right text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
