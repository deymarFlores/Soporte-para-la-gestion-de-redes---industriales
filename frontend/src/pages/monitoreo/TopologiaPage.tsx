import { useMemo, useState } from "react";
import { useTopology } from "../../context/TopologyContext.js";
import { StatusBadge } from "../../components/StatusBadge.js";
import type { EquipoView, TramoView } from "../../types/topology.js";

interface TreeNode {
  equipo: EquipoView;
  incomingTramo: TramoView | null;
  children: TreeNode[];
}

function buildForest(equipos: EquipoView[], tramos: TramoView[]): TreeNode[] {
  const nodeById = new Map<string, TreeNode>(
    equipos.map((equipo) => [equipo.id, { equipo, incomingTramo: null, children: [] }])
  );
  const childIds = new Set<string>();

  for (const tramo of tramos) {
    const parent = nodeById.get(tramo.origenEquipoId);
    const child = nodeById.get(tramo.destinoEquipoId);
    if (!parent || !child) continue;
    child.incomingTramo = tramo;
    parent.children.push(child);
    childIds.add(child.equipo.id);
  }

  return Array.from(nodeById.values()).filter((node) => !childIds.has(node.equipo.id));
}

type Selection = { kind: "equipo"; id: string } | { kind: "tramo"; id: string } | null;

function statusBorderClass(estado: EquipoView["estado"]): string {
  if (estado === "UP") return "border-status-up";
  if (estado === "DOWN") return "border-status-down";
  return "border-border";
}

function NodeCard({
  node,
  selection,
  onSelectEquipo,
  onSelectTramo,
}: {
  node: TreeNode;
  selection: Selection;
  onSelectEquipo: (id: string) => void;
  onSelectTramo: (id: string) => void;
}) {
  const isSelected = selection?.kind === "equipo" && selection.id === node.equipo.id;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onSelectEquipo(node.equipo.id)}
        className={`card flex min-w-[180px] flex-col gap-2 border px-4 py-3 text-left transition-colors duration-200 ${statusBorderClass(
          node.equipo.estado
        )} ${isSelected ? "ring-2 ring-accent" : ""}`}
      >
        <span className="text-xs uppercase tracking-wide text-ink-muted">{node.equipo.tipo}</span>
        <span className="font-medium text-ink">{node.equipo.nombre}</span>
        <span className="font-mono text-xs text-ink-muted">{node.equipo.ip}</span>
        <StatusBadge status={node.equipo.estado === "SIN_MONITOREO" ? "UNKNOWN" : node.equipo.estado} />
      </button>

      {node.children.length > 0 && (
        <>
          <span aria-hidden className="text-ink-muted">
            →
          </span>
          <div className="flex flex-col gap-3">
            {node.children.map((child) => (
              <div key={child.equipo.id} className="flex items-center gap-2">
                {child.incomingTramo && (
                  <button
                    type="button"
                    onClick={() => onSelectTramo(child.incomingTramo!.id)}
                    className={`rounded-full border px-2 py-0.5 text-[11px] transition-colors duration-200 ${
                      selection?.kind === "tramo" && selection.id === child.incomingTramo.id
                        ? "border-accent text-accent"
                        : "border-border text-ink-muted hover:border-accent hover:text-ink"
                    }`}
                  >
                    {child.incomingTramo.nombre}
                  </button>
                )}
                <NodeCard node={child} selection={selection} onSelectEquipo={onSelectEquipo} onSelectTramo={onSelectTramo} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-2 last:border-0">
      <span className="text-ink-muted">{label}</span>
      <span className="text-right text-ink">{value}</span>
    </div>
  );
}

function EquipoDetailPanel({ equipo }: { equipo: EquipoView }) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <h2 className="text-base font-semibold text-ink">{equipo.nombre}</h2>
      <DetailRow label="Tipo" value={equipo.tipo} />
      <DetailRow label="IP / host" value={equipo.ip} />
      <DetailRow label="Sitio" value={equipo.sitio} />
      <DetailRow label="Estado" value={equipo.estado === "SIN_MONITOREO" ? "Sin monitoreo" : equipo.estado} />
      <DetailRow
        label="Última comprobación"
        value={
          equipo.ultimaComprobacion
            ? new Date(equipo.ultimaComprobacion).toLocaleString("es-BO", { dateStyle: "short", timeStyle: "medium" })
            : "—"
        }
      />
    </div>
  );
}

function TramoDetailPanel({ tramo }: { tramo: TramoView }) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <h2 className="text-base font-semibold text-ink">{tramo.nombre}</h2>
      <DetailRow label="Origen" value={tramo.origenNombre} />
      <DetailRow label="Destino" value={tramo.destinoNombre} />
      <DetailRow label="Estado" value={tramo.estado === "SIN_MONITOREO" ? "Sin monitoreo" : tramo.estado} />
      <DetailRow label="Tipo de conexión" value={tramo.tipoConexion} />
      <DetailRow label="Latencia" value="No disponible aún" />
      <DetailRow label="Pérdida de paquetes" value="No disponible aún" />
      <DetailRow label="Umbral de latencia" value={`${tramo.umbralLatenciaMs} ms`} />
      <DetailRow label="Umbral de pérdida" value={`${tramo.umbralPerdidaPct}%`} />
    </div>
  );
}

export function TopologiaPage() {
  const { equipos, tramos, monitoringLoading, monitoringError } = useTopology();
  const [selection, setSelection] = useState<Selection>(null);

  const forest = useMemo(() => buildForest(equipos, tramos), [equipos, tramos]);
  const selectedEquipo = selection?.kind === "equipo" ? (equipos.find((e) => e.id === selection.id) ?? null) : null;
  const selectedTramo = selection?.kind === "tramo" ? (tramos.find((t) => t.id === selection.id) ?? null) : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="page-title">Topología</h1>
        <p className="page-subtitle">Diagrama del enlace, de punto remoto a planta</p>
      </div>

      {monitoringLoading ? (
        <p className="text-ink-muted">Cargando topología…</p>
      ) : monitoringError ? (
        <div className="alert-danger">No se pudo cargar la topología: {monitoringError}</div>
      ) : forest.length === 0 ? (
        <div className="empty-state">Todavía no hay equipos registrados.</div>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 overflow-x-auto">
            <div className="flex flex-col gap-6">
              {forest.map((root) => (
                <NodeCard
                  key={root.equipo.id}
                  node={root}
                  selection={selection}
                  onSelectEquipo={(id) => setSelection({ kind: "equipo", id })}
                  onSelectTramo={(id) => setSelection({ kind: "tramo", id })}
                />
              ))}
            </div>
          </div>

          <aside className="card w-full shrink-0 p-5 lg:w-80">
            {selectedEquipo ? (
              <EquipoDetailPanel equipo={selectedEquipo} />
            ) : selectedTramo ? (
              <TramoDetailPanel tramo={selectedTramo} />
            ) : (
              <p className="text-sm text-ink-muted">Selecciona un equipo o un tramo del diagrama para ver su detalle.</p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
