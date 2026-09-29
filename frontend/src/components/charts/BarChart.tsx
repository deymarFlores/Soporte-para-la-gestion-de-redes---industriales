import { useState } from "react";
import type { ChartPoint } from "./LineChart.js";

export function BarChart({
  data,
  formatValue = (value: number) => String(value),
}: {
  data: ChartPoint[];
  formatValue?: (value: number) => string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const width = 600;
  const height = 220;
  const paddingLeft = 40;
  const paddingBottom = 32;
  const paddingTop = 12;
  const paddingRight = 12;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  if (data.length === 0) {
    return <p className="text-sm text-ink-muted">No hay datos suficientes todavía.</p>;
  }

  const maxValue = Math.max(1, ...data.map((point) => point.value));
  const barGap = 10;
  const barWidth = Math.max(14, plotWidth / data.length - barGap);

  function xFor(index: number): number {
    return paddingLeft + index * (barWidth + barGap);
  }
  function heightFor(value: number): number {
    return (value / maxValue) * plotHeight;
  }

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Gráfico de barras">
        <line
          x1={paddingLeft}
          x2={width - paddingRight}
          y1={paddingTop + plotHeight}
          y2={paddingTop + plotHeight}
          stroke="var(--border)"
          strokeWidth={1}
        />

        {data.map((point, index) => (
          <g key={`${point.label}-${index}`}>
            <rect
              x={xFor(index)}
              y={paddingTop + plotHeight - heightFor(point.value)}
              width={barWidth}
              height={Math.max(1, heightFor(point.value))}
              rx={4}
              fill="var(--accent)"
              opacity={hoverIndex === null || hoverIndex === index ? 1 : 0.45}
              className="cursor-pointer transition-opacity duration-150"
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex((current) => (current === index ? null : current))}
            />
            <text
              x={xFor(index) + barWidth / 2}
              y={height - paddingBottom + 14}
              textAnchor="middle"
              fontSize={10}
              fill="var(--ink-muted)"
            >
              {point.label.length > 12 ? `${point.label.slice(0, 11)}…` : point.label}
            </text>
          </g>
        ))}
      </svg>

      {hoverIndex !== null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-[calc(100%+8px)] whitespace-nowrap rounded-md border border-border bg-surface-raised px-2 py-1 text-xs"
          style={{
            left: `${((xFor(hoverIndex) + barWidth / 2) / width) * 100}%`,
            top: `${((paddingTop + plotHeight - heightFor(data[hoverIndex].value)) / height) * 100}%`,
          }}
        >
          <div className="font-medium text-ink">{formatValue(data[hoverIndex].value)}</div>
          <div className="text-ink-muted">{data[hoverIndex].label}</div>
        </div>
      )}
    </div>
  );
}
