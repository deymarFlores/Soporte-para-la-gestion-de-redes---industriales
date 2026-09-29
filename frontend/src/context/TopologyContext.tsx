import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useMonitoringDashboard, type ConnectionStatus } from "../hooks/useMonitoringDashboard.js";
import type { IncidentResponseDTO, NodeResponseDTO } from "../types/monitoring.js";
import type { EquipoInput, EquipoRecord, EquipoView, TramoInput, TramoRecord, TramoView } from "../types/topology.js";

interface TopologyContextValue {
  nodes: NodeResponseDTO[];
  activeIncidents: IncidentResponseDTO[];
  connectionStatus: ConnectionStatus;
  monitoringLoading: boolean;
  monitoringError: string | null;

  equipos: EquipoView[];
  tramos: TramoView[];

  createEquipo: (data: EquipoInput) => void;
  updateEquipo: (id: string, data: Partial<EquipoInput>) => void;
  removeEquipo: (id: string) => void;

  createTramo: (data: TramoInput) => void;
  updateTramo: (id: string, data: Partial<TramoInput>) => void;
  removeTramo: (id: string) => void;
}

const TopologyContext = createContext<TopologyContextValue | null>(null);

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function TopologyProvider({ children }: { children: ReactNode }) {
  const { nodes, activeIncidents, connectionStatus, loading, error } = useMonitoringDashboard();
  const [equipoRecords, setEquipoRecords] = useState<EquipoRecord[]>([]);
  const [tramoRecords, setTramoRecords] = useState<TramoRecord[]>([]);
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current || loading || nodes.length === 0) return;
    seeded.current = true;

    const seededEquipos: EquipoRecord[] = nodes.map((node) => ({
      id: node.id,
      nombre: node.name,
      tipo: node.type,
      ip: node.ip ?? "",
      sitio: "Planta Principal",
      descripcion: "",
      parametrosMonitoreo: "ICMP cada 30s",
      habilitado: true,
      accesoRemotoHabilitado: node.type === "PLC",
      createdAt: new Date().toISOString(),
    }));

    const seededTramos: TramoRecord[] = nodes
      .filter((node) => node.parentId)
      .map((node) => {
        const origenNombre = nodes.find((candidate) => candidate.id === node.parentId)?.name ?? "?";
        return {
          id: generateId("tramo"),
          nombre: `${origenNombre} → ${node.name}`,
          origenEquipoId: node.parentId as string,
          destinoEquipoId: node.id,
          tipoConexion: "Ethernet",
          metodoMonitoreo: "ICMP",
          intervaloComprobacionSegundos: 30,
          umbralLatenciaMs: 200,
          umbralPerdidaPct: 5,
          habilitado: true,
          createdAt: new Date().toISOString(),
        };
      });

    setEquipoRecords(seededEquipos);
    setTramoRecords(seededTramos);
  }, [nodes, loading]);

  const equipos = useMemo<EquipoView[]>(
    () =>
      equipoRecords.map((record) => {
        const backendNode = nodes.find((node) => node.ip && node.ip === record.ip);
        return {
          ...record,
          estado: backendNode ? backendNode.currentStatus : "SIN_MONITOREO",
          ultimaComprobacion: backendNode?.lastCheckedAt ?? null,
          vinculadoBackend: Boolean(backendNode),
        };
      }),
    [equipoRecords, nodes]
  );

  const tramos = useMemo<TramoView[]>(
    () =>
      tramoRecords.map((record) => {
        const origen = equipos.find((equipo) => equipo.id === record.origenEquipoId);
        const destino = equipos.find((equipo) => equipo.id === record.destinoEquipoId);
        return {
          ...record,
          estado: destino?.estado ?? "SIN_MONITOREO",
          origenNombre: origen?.nombre ?? "Desconocido",
          destinoNombre: destino?.nombre ?? "Desconocido",
        };
      }),
    [tramoRecords, equipos]
  );

  const value: TopologyContextValue = {
    nodes,
    activeIncidents,
    connectionStatus,
    monitoringLoading: loading,
    monitoringError: error,

    equipos,
    tramos,

    createEquipo: (data) =>
      setEquipoRecords((prev) => [
        ...prev,
        { ...data, id: generateId("equipo"), createdAt: new Date().toISOString() },
      ]),
    updateEquipo: (id, data) =>
      setEquipoRecords((prev) => prev.map((equipo) => (equipo.id === id ? { ...equipo, ...data } : equipo))),
    removeEquipo: (id) => {
      setEquipoRecords((prev) => prev.filter((equipo) => equipo.id !== id));
      setTramoRecords((prev) => prev.filter((tramo) => tramo.origenEquipoId !== id && tramo.destinoEquipoId !== id));
    },

    createTramo: (data) =>
      setTramoRecords((prev) => [...prev, { ...data, id: generateId("tramo"), createdAt: new Date().toISOString() }]),
    updateTramo: (id, data) =>
      setTramoRecords((prev) => prev.map((tramo) => (tramo.id === id ? { ...tramo, ...data } : tramo))),
    removeTramo: (id) => setTramoRecords((prev) => prev.filter((tramo) => tramo.id !== id)),
  };

  return <TopologyContext.Provider value={value}>{children}</TopologyContext.Provider>;
}

export function useTopology(): TopologyContextValue {
  const context = useContext(TopologyContext);
  if (!context) throw new Error("useTopology debe usarse dentro de TopologyProvider");
  return context;
}
