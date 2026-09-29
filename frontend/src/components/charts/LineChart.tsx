import { useState } from "react";

export interface ChartPoint {
  label: string;
  value: number;
}

export function LineChart({
  data,
  formatValue = (value: number) => String(value),
  yMax,
}: {
  data: ChartPoint[];
  formatValue?: (value: number) => string;
  yMax?: number;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const width = 600;
  const height = 220;
  const paddingLeft = 40;
  const paddingBottom = 24;
  const paddingTop = 12;
  const paddingRight = 12;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const values = data.map((point) => point.value);
  const maxValue = yMax ?? Math.max(1, ...values);
  const minValue = Math.min(0, ...values);

  function xFor(index: number): number {
    return paddingLeft + (data.length <= 1 ? 0 : (index / (data.length - 1)) * plotWidth);
  }
  function yFor(value: number): number {
    const ratio = (value - minValue) / (maxValue - minValue || 1);
    return paddingTop + plotHeight - ratio * plotHeight;
  }

  const pathD = data.map((point, index) => `${index === 0 ? "M" : "L"} ${xFor(index)} ${yFor(point.value)}`).join(" ");
  const gridSteps = 4;
  const gridValues = Array.from({ length: gridSteps + 1 }, (_, i) => Math.round((maxValue / gridSteps) * i));
  const labelEvery = Math.max(1, Math.ceil(data.length / 7));

  if (data.length === 0) {
    return <p className="text-sm text-ink-muted">No hay datos suficientes para este período.</p>;
  }

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Gráfico de línea">
        {gridValues.map((value) => (
          <g key={value}>
            <line x1={paddingLeft} x2={width - paddingRight} y1={yFor(value)} y2={yFor(value)} stroke="var(--border)" strokeWidth={1} />
            <text x={paddingLeft - 8} y={yFor(value)} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="var(--ink-muted)">
              {value}
            </text>
          </g>
        ))}

        <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {data.map((point, index) => (
          <circle
            key={`${point.label}-${index}`}
            cx={xFor(index)}
            cy={yFor(point.value)}
            r={hoverIndex === index ? 5 : 3.5}
            fill="var(--accent)"
            stroke="var(--surface-raised)"
            strokeWidth={2}
            className="cursor-pointer transition-[r] duration-150"
            onMouseEnter={() => setHoverIndex(index)}
            onMouseLeave={() => setHoverIndex((current) => (current === index ? null : current))}
          />
        ))}

        {data.map((point, index) =>
          index % labelEvery === 0 ? (
            <text key={`x-${point.label}-${index}`} x={xFor(index)} y={height - 6} textAnchor="middle" fontSize={10} fill="var(--ink-muted)">
              {point.label}
            </text>
          ) : null
        )}
      </svg>

      {hoverIndex !== null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-[calc(100%+8px)] whitespace-nowrap rounded-md border border-border bg-surface-raised px-2 py-1 text-xs"
          style={{ left: `${(xFor(hoverIndex) / width) * 100}%`, top: `${(yFor(data[hoverIndex].value) / height) * 100}%` }}
        >
          <div className="font-medium text-ink">{formatValue(data[hoverIndex].value)}</div>
          <div className="text-ink-muted">{data[hoverIndex].label}</div>
        </div>
      )}
    </div>
  );
}
