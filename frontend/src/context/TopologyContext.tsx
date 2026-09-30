import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useMonitoringDashboard, type ConnectionStatus } from "../hooks/useMonitoringDashboard.js";
import { listSitios, createSitio as createSitioApi, updateSitio as updateSitioApi, deleteSitio as deleteSitioApi } from "../api/sites.js";
import {
  listEquipos,
  createEquipo as createEquipoApi,
  updateEquipo as updateEquipoApi,
  deleteEquipo as deleteEquipoApi,
  toEquipoRecord,
} from "../api/nodes.js";
import {
  listTramos,
  createTramo as createTramoApi,
  updateTramo as updateTramoApi,
  deleteTramo as deleteTramoApi,
} from "../api/segments.js";
import type { IncidentResponseDTO, NodeResponseDTO } from "../types/monitoring.js";
import type {
  EquipoInput,
  EquipoRecord,
  EquipoView,
  SitioInput,
  SitioRecord,
  TramoInput,
  TramoRecord,
  TramoView,
} from "../types/topology.js";

interface TopologyContextValue {
  nodes: NodeResponseDTO[];
  activeIncidents: IncidentResponseDTO[];
  connectionStatus: ConnectionStatus;
  monitoringLoading: boolean;
  monitoringError: string | null;

  sitios: SitioRecord[];
  equipos: EquipoView[];
  tramos: TramoView[];
  topologyLoading: boolean;
  topologyError: string | null;

  createSitio: (data: SitioInput) => Promise<void>;
  updateSitio: (id: string, data: Partial<SitioInput>) => Promise<void>;
  removeSitio: (id: string) => Promise<void>;

  createEquipo: (data: EquipoInput) => Promise<void>;
  updateEquipo: (id: string, data: Partial<EquipoInput>) => Promise<void>;
  removeEquipo: (id: string) => Promise<void>;

  createTramo: (data: TramoInput) => Promise<void>;
  updateTramo: (id: string, data: Partial<TramoInput>) => Promise<void>;
  removeTramo: (id: string) => Promise<void>;
}

const TopologyContext = createContext<TopologyContextValue | null>(null);

export function TopologyProvider({ children }: { children: ReactNode }) {
  const {
    nodes,
    activeIncidents,
    connectionStatus,
    loading: monitoringLoading,
    error: monitoringError,
  } = useMonitoringDashboard();

  const [sitios, setSitios] = useState<SitioRecord[]>([]);
  const [equipoRecords, setEquipoRecords] = useState<EquipoRecord[]>([]);
  const [tramoRecords, setTramoRecords] = useState<TramoRecord[]>([]);
  const [topologyLoading, setTopologyLoading] = useState(true);
  const [topologyError, setTopologyError] = useState<string | null>(null);

  async function refreshAll(): Promise<void> {
    try {
      const [sitiosData, equiposData, tramosData] = await Promise.all([listSitios(), listEquipos(), listTramos()]);
      setSitios(sitiosData);
      setEquipoRecords(equiposData.map(toEquipoRecord));
      setTramoRecords(tramosData);
      setTopologyError(null);
    } catch (error) {
      setTopologyError((error as Error).message);
    } finally {
      setTopologyLoading(false);
    }
  }

  useEffect(() => {
    void refreshAll();
  }, []);

  const equipos = useMemo<EquipoView[]>(
    () =>
      equipoRecords.map((record) => {
        const liveNode = nodes.find((node) => node.id === record.id);
        const sitio = sitios.find((candidate) => candidate.id === record.sitioId);
        return {
          ...record,
          estado: liveNode?.currentStatus ?? "UNKNOWN",
          ultimaComprobacion: liveNode?.lastCheckedAt ?? null,
          sitioNombre: sitio?.nombre ?? "Sin sitio",
        };
      }),
    [equipoRecords, nodes, sitios]
  );

  const tramos = useMemo<TramoView[]>(
    () =>
      tramoRecords.map((record) => {
        const origen = equipos.find((equipo) => equipo.id === record.origenEquipoId);
        const destino = equipos.find((equipo) => equipo.id === record.destinoEquipoId);
        return {
          ...record,
          estado: destino?.estado ?? "UNKNOWN",
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
    monitoringLoading,
    monitoringError,

    sitios,
    equipos,
    tramos,
    topologyLoading,
    topologyError,

    createSitio: async (data) => {
      await createSitioApi(data);
      await refreshAll();
    },
    updateSitio: async (id, data) => {
      await updateSitioApi(id, data);
      await refreshAll();
    },
    removeSitio: async (id) => {
      await deleteSitioApi(id);
      await refreshAll();
    },

    createEquipo: async (data) => {
      await createEquipoApi(data);
      await refreshAll();
    },
    updateEquipo: async (id, data) => {
      await updateEquipoApi(id, data);
      await refreshAll();
    },
    removeEquipo: async (id) => {
      await deleteEquipoApi(id);
      await refreshAll();
    },

    createTramo: async (data) => {
      await createTramoApi(data);
      await refreshAll();
    },
    updateTramo: async (id, data) => {
      await updateTramoApi(id, data);
      await refreshAll();
    },
    removeTramo: async (id) => {
      await deleteTramoApi(id);
      await refreshAll();
    },
  };

  return <TopologyContext.Provider value={value}>{children}</TopologyContext.Provider>;
}

export function useTopology(): TopologyContextValue {
  const context = useContext(TopologyContext);
  if (!context) throw new Error("useTopology debe usarse dentro de TopologyProvider");
  return context;
}
