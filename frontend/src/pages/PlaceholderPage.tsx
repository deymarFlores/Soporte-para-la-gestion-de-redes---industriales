export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{description}</p>
      </div>
      <div className="empty-state">Esta vista todavía no está construida — llega en la siguiente fase.</div>
    </div>
  );
}
