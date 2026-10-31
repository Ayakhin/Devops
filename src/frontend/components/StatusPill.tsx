export function StatusPill({ status }: { status: string }) {
  const active = ["running", "Running", "operational", "up"].includes(status);
  const pending = status === "Pending" || status === "degraded";
  return (
    <span className={`status-pill ${active ? "status-ok" : pending ? "status-warn" : "status-off"}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}
