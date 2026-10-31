import { useEffect, useState } from "react";
import { CircleX, Terminal } from "lucide-react";

interface LogsModalProps {
  containerId: string;
  containerName: string;
  environment: "dev" | "prod";
  isPod?: boolean;
  onClose: () => void;
}

export function LogsModal({ containerId, containerName, environment, isPod = false, onClose }: LogsModalProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [connection, setConnection] = useState<"connecting" | "connected" | "error">("connecting");

  useEffect(() => {
    if (isPod) {
      fetch(`/api/kubernetes/pods/${encodeURIComponent(containerId)}/logs?environment=${environment}`)
        .then(async (response) => {
          const result = await response.json() as { data?: string[]; error?: string };
          if (!response.ok) throw new Error(result.error ?? `Erreur ${response.status}`);
          setLines(result.data ?? []);
          setConnection("connected");
        })
        .catch(() => setConnection("error"));
      return;
    }
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(`${protocol}//${window.location.host}/ws?containerId=${encodeURIComponent(containerId)}&environment=${environment}`);
    socket.onopen = () => setConnection("connected");
    socket.onmessage = (event: MessageEvent<string>) => {
      setLines((current) => [...current.slice(-70), event.data]);
    };
    socket.onerror = () => setConnection("error");
    socket.onclose = () => setConnection((current) => current === "error" ? "error" : "connecting");
    return () => socket.close();
  }, [containerId, environment, isPod]);

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="logs-title" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="icon-tile"><Terminal size={16} /></span>
            <div>
              <h2 id="logs-title" className="text-sm font-semibold text-white">{containerName}</h2>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">{isPod ? "Logs du pod · REST" : "Flux de logs · WebSocket"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className={`font-mono text-[10px] uppercase ${connection === "connected" ? "text-emerald-400" : connection === "error" ? "text-red-400" : "text-amber-400"}`}>
              {connection === "connected" ? "● connecté" : connection === "error" ? "● erreur" : "● connexion…"}
            </span>
            <button type="button" className="icon-button" aria-label="Fermer" onClick={onClose}><CircleX size={18} /></button>
          </div>
        </div>
        <div className="terminal-screen" aria-live="polite">
          {lines.length === 0 && <p className="text-slate-600">En attente du flux…</p>}
          {lines.map((line, index) => (
            <p key={`${index}-${line}`} className="terminal-line">
              <span className="mr-3 text-slate-600">{String(index + 1).padStart(3, "0")}</span>
              <span className={line.includes("WARN") ? "text-amber-300" : "text-emerald-300"}>{line}</span>
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
