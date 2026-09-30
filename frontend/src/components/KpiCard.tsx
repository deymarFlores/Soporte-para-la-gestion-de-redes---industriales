export function KpiCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card flex flex-col gap-1 p-4">
      <span className="section-label">{label}</span>
      <span className="text-2xl font-semibold text-ink">{value}</span>
      {hint && <span className="text-xs text-ink-muted">{hint}</span>}
    </div>
  );
}
