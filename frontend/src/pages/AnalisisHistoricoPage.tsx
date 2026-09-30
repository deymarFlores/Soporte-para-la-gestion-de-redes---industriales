import { useEffect, useMemo, useState } from "react";
import { useTopology } from "../context/TopologyContext.js";
import { listIncidents } from "../api/monitoring.js";
import { ChartSection } from "../components/charts/ChartSection.js";
import type { ChartPoint } from "../components/charts/LineChart.js";
import type { IncidentResponseDTO } from "../types/monitoring.js";
import type { EquipoView } from "../types/topology.js";

function startOfDay(ms: number): number {
  const date = new Date(ms);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function formatDayLabel(ms: number): string {
  return new Date(ms).toLocaleDateString("es-BO", { day: "2-digit", month: "2-digit" });
}

function computeDailyAvailability(incidents: IncidentResponseDTO[], equipoCount: number, days: number): ChartPoint[] {
  const now = Date.now();
  const points: ChartPoint[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const dayStart = startOfDay(now - i * 86_400_000);
    const dayEnd = dayStart + 86_400_000;

    let downtimeSeconds = 0;
    for (const incident of incidents) {
      const start = new Date(incident.startedAt).getTime();
      const end = incident.resolvedAt ? new Date(incident.resolvedAt).getTime() : now;
      const overlapStart = Math.max(start, dayStart);
      const overlapEnd = Math.min(end, dayEnd);
      if (overlapEnd > overlapStart) downtimeSeconds += (overlapEnd - overlapStart) / 1000;
    }

    const totalSeconds = Math.max(1, equipoCount) * 86_400;
    const availability = equipoCount === 0 ? 100 : Math.max(0, 100 - (downtimeSeconds / totalSeconds) * 100);

    points.push({ label: formatDayLabel(dayStart), value: Math.round(availability * 10) / 10 });
  }

  return points;
}

function countByEquipo(incidents: IncidentResponseDTO[], equipos: EquipoView[]): ChartPoint[] {
  const counts = new Map<string, number>();
  for (const incident of incidents) counts.set(incident.nodeId, (counts.get(incident.nodeId) ?? 0) + 1);

  return Array.from(counts.entries())
    .map(([nodeId, value]) => ({ label: equipos.find((equipo) => equipo.id === nodeId)?.nombre ?? "Desconocido", value }))
    .sort((a, b) => b.value - a.value);
}

function durationByEquipo(incidents: IncidentResponseDTO[], equipos: EquipoView[]): ChartPoint[] {
  const now = Date.now();
  const totals = new Map<string, number>();

  for (const incident of incidents) {
    const start = new Date(incident.startedAt).getTime();
    const end = incident.resolvedAt ? new Date(incident.resolvedAt).getTime() : now;
    const seconds = incident.durationSeconds ?? Math.max(0, (end - start) / 1000);
    totals.set(incident.nodeId, (totals.get(incident.nodeId) ?? 0) + seconds);
  }

  return Array.from(totals.entries())
    .map(([nodeId, seconds]) => ({
      label: equipos.find((equipo) => equipo.id === nodeId)?.nombre ?? "Desconocido",
      value: Math.round(seconds / 60),
    }))
    .sort((a, b) => b.value - a.value);
}

export function AnalisisHistoricoPage() {
  const { equipos } = useTopology();
  const [incidents, setIncidents] = useState<IncidentResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [periodo, setPeriodo] = useState(14);
  const [equipoFilter, setEquipoFilter] = useState("");

  useEffect(() => {
    listIncidents()
      .then((all) => {
        setIncidents(all);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredIncidents = useMemo(
    () => (equipoFilter === "" ? incidents : incidents.filter((incident) => incident.nodeId === equipoFilter)),
    [incidents, equipoFilter]
  );

  const equipoCountForAvailability = equipoFilter === "" ? equipos.length : 1;

  const availability = useMemo(
    () => computeDailyAvailability(filteredIncidents, equipoCountForAvailability, periodo),
    [filteredIncidents, equipoCountForAvailability, periodo]
  );
  const incidentesPorEquipo = useMemo(() => countByEquipo(filteredIncidents, equipos), [filteredIncidents, equipos]);
  const duracionPorEquipo = useMemo(() => durationByEquipo(filteredIncidents, equipos), [filteredIncidents, equipos]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="page-title">Análisis histórico</h1>
        <p className="page-subtitle">Disponibilidad, incidentes y su duración en el tiempo</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select className="input w-40" value={periodo} onChange={(event) => setPeriodo(Number(event.target.value))}>
          <option value={7}>Últimos 7 días</option>
          <option value={14}>Últimos 14 días</option>
          <option value={30}>Últimos 30 días</option>
        </select>
        <select className="input w-48" value={equipoFilter} onChange={(event) => setEquipoFilter(event.target.value)}>
          <option value="">Todos los equipos</option>
          {equipos.map((equipo) => (
            <option key={equipo.id} value={equipo.id}>
              {equipo.nombre}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-ink-muted">Cargando historial…</p>
      ) : error ? (
        <div className="alert-danger">No se pudo cargar el historial: {error}</div>
      ) : (
        <>
          <ChartSection
            title="Disponibilidad"
            type="line"
            data={availability}
            formatValue={(value) => `${value}%`}
          />

          <ChartSection
            title="Incidentes por equipo"
            type="bar"
            data={incidentesPorEquipo}
            formatValue={(value) => `${value} incidente${value === 1 ? "" : "s"}`}
          />

          <ChartSection
            title="Duración acumulada de incidentes"
            type="bar"
            data={duracionPorEquipo}
            formatValue={(value) => `${value} min`}
          />

          <section className="flex flex-col gap-3">
            <h2 className="section-label">Latencia y pérdida de paquetes</h2>
            <div className="empty-state">
              El backend todavía no expone series históricas de latencia ni pérdida de paquetes — solo el estado
              actual de cada equipo. Se mostrarán aquí cuando el endpoint de historial las incluya.
            </div>
          </section>
        </>
      )}
    </div>
  );
}
