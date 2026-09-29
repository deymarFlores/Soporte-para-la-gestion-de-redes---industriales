import { useState } from "react";
import { LineChart, type ChartPoint } from "./LineChart.js";
import { BarChart } from "./BarChart.js";

export function ChartSection({
  title,
  type,
  data,
  formatValue = (value: number) => String(value),
  emptyMessage,
}: {
  title: string;
  type: "line" | "bar";
  data: ChartPoint[];
  formatValue?: (value: number) => string;
  emptyMessage?: string;
}) {
  const [view, setView] = useState<"chart" | "table">("chart");

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="section-label">{title}</h2>
        {data.length > 0 && (
          <button
            type="button"
            onClick={() => setView((current) => (current === "chart" ? "table" : "chart"))}
            className="text-xs text-accent hover:underline"
          >
            {view === "chart" ? "Ver tabla" : "Ver gráfico"}
          </button>
        )}
      </div>

      <div className="card p-5">
        {data.length === 0 ? (
          <p className="text-sm text-ink-muted">{emptyMessage ?? "No hay datos suficientes todavía."}</p>
        ) : view === "chart" ? (
          type === "line" ? (
            <LineChart data={data} formatValue={formatValue} />
          ) : (
            <BarChart data={data} formatValue={formatValue} />
          )
        ) : (
          <table className="w-full border-collapse text-sm">
            <tbody>
              {data.map((point) => (
                <tr key={point.label} className="border-b border-border last:border-0">
                  <td className="px-2 py-2 text-ink-muted">{point.label}</td>
                  <td className="px-2 py-2 text-right text-ink">{formatValue(point.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
