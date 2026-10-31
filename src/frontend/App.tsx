import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, Bell, Box, Check, ChevronDown, CircleHelp, Clock3, Cpu,
  Database, Gauge, HardDrive, Layers3, Menu, Plus, RefreshCw, Settings, ShieldCheck, Trash2,
  TriangleAlert, X,
} from "lucide-react";
import { apiRequest } from "./api";
import { LogsModal } from "./components/LogsModal";
import { SectionTitle } from "./components/SectionTitle";
import { StatusPill } from "./components/StatusPill";
import type { Alert, Container, DashboardData, Pod, Setting } from "./types";

type View = "overview" | "containers" | "kubernetes" | "monitoring" | "settings";
type Notice = { tone: "success" | "error"; message: string };
type SettingDraft = Omit<Setting, "id">;

const navigation: Array<{ id: View; label: string; icon: typeof Activity }> = [
  { id: "overview", label: "Vue d’ensemble", icon: Gauge },
  { id: "containers", label: "Conteneurs", icon: Box },
  { id: "kubernetes", label: "Kubernetes", icon: Layers3 },
  { id: "monitoring", label: "Monitoring", icon: Activity },
  { id: "settings", label: "Paramètres", icon: Settings },
];
const emptyDraft: SettingDraft = { name: "", type: "alert", value: "", active: true };
const ResourceChart = lazy(() => import("./components/ResourceChart").then((module) => ({ default: module.ResourceChart })));

function MetricCard({ label, value, detail, icon: Icon, trend }: {
  label: string; value: string; detail: string; icon: typeof Activity; trend?: "up" | "down";
}) {
  return <article className="metric-card">
    <div className="flex items-start justify-between"><p className="metric-label">{label}</p><span className="metric-icon"><Icon size={16} /></span></div>
    <p className="mt-5 font-mono text-[26px] font-medium leading-none tracking-tight text-white">{value}</p>
    <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">{trend && (trend === "up" ? <ArrowUpRight size={13} className="text-emerald-400" /> : <ArrowDownRight size={13} className="text-red-400" />)}<span>{detail}</span></div>
  </article>;
}

function ContainerRows({ containers, onAction, onLogs }: {
  containers: Container[];
  onAction: (container: Container, action: "start" | "stop" | "restart" | "remove") => void;
  onLogs: (container: Container) => void;
}) {
  return <div className="table-scroll"><table className="data-table">
    <thead><tr><th>Conteneur</th><th>Statut</th><th>CPU / RAM</th><th>Ports</th><th>Volumes</th><th>Actions</th></tr></thead>
    <tbody>{containers.map((container) => <tr key={container.id}>
      <td><div className="flex items-center gap-3"><span className="row-icon"><Box size={15} /></span><div><p className="font-medium text-slate-200">{container.name}</p><p className="mt-1 font-mono text-[10px] text-slate-500">{container.image}</p></div></div></td>
      <td><StatusPill status={container.status} /></td>
      <td><span className="font-mono text-xs text-slate-300">{container.cpu.toFixed(1)}%</span><span className="mx-2 text-slate-700">/</span><span className="font-mono text-xs text-slate-400">{container.memory} MB</span></td>
      <td className="font-mono text-xs text-slate-400">{container.ports.length ? container.ports.join(", ") : "—"}</td>
      <td className="max-w-40 truncate font-mono text-xs text-slate-500" title={container.volumes.join(", ")}>{container.volumes.length ? container.volumes.join(", ") : "—"}</td>
      <td><div className="flex items-center gap-1"><button type="button" className="table-action" onClick={() => onLogs(container)}>LOGS</button><button type="button" className="table-action" onClick={() => onAction(container, container.status === "running" ? "stop" : "start")}>{container.status === "running" ? "STOP" : "START"}</button><button type="button" className="table-action" onClick={() => onAction(container, "restart")}>RESTART</button><button type="button" className="table-action table-action-danger" title="Supprimer" onClick={() => onAction(container, "remove")}><Trash2 size={13} /></button></div></td>
    </tr>)}{containers.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-sm text-slate-500">Aucun conteneur dans cet environnement.</td></tr>}</tbody>
  </table></div>;
}

function PodRows({ pods, onScale, onLogs }: { pods: Pod[]; onScale: (name: string, replicas: number) => void; onLogs: (pod: Pod) => void }) {
  const deployments = useMemo(() => Array.from(new Set(["api", "web", "worker", ...pods.map((pod) => pod.deployment)])), [pods]);
  return <>
    <div className="flex flex-wrap gap-2 border-b border-line px-5 py-3">{deployments.map((deployment) => {
      const count = pods.filter((pod) => pod.deployment === deployment).length;
      return <div key={deployment} className="flex items-center gap-2 rounded-md border border-line bg-ink px-2 py-1"><span className="font-mono text-[11px] text-slate-300">{deployment}</span><button type="button" className="scale-button" aria-label={`Réduire ${deployment}`} onClick={() => onScale(deployment, Math.max(0, count - 1))}>−</button><span className="w-4 text-center font-mono text-xs text-white">{count}</span><button type="button" className="scale-button" aria-label={`Augmenter ${deployment}`} onClick={() => onScale(deployment, Math.min(10, count + 1))}>+</button></div>;
    })}</div>
    <div className="table-scroll"><table className="data-table">
      <thead><tr><th>Pod</th><th>Statut</th><th>CPU / RAM</th><th>Restarts</th><th>Âge / Node</th><th>Logs</th></tr></thead>
      <tbody>{pods.map((pod) => <tr key={pod.name}>
        <td><p className="font-mono text-xs text-slate-300">{pod.name}</p><p className="mt-1 text-[10px] text-slate-500">deployment/{pod.deployment}</p></td>
        <td><StatusPill status={pod.status} /></td><td><span className="font-mono text-xs text-slate-300">{pod.cpu}m</span><span className="mx-2 text-slate-700">/</span><span className="font-mono text-xs text-slate-400">{pod.memory} Mi</span></td>
        <td><span className={pod.restarts > 2 ? "font-mono text-xs text-amber-300" : "font-mono text-xs text-slate-400"}>{pod.restarts}</span></td><td><p className="text-xs text-slate-300">{pod.age}</p><p className="mt-1 font-mono text-[10px] text-slate-500">{pod.node}</p></td>
        <td><button type="button" className="table-action" onClick={() => onLogs(pod)}>VOIR</button></td>
      </tr>)}{pods.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-sm text-slate-500">Aucun pod pour le moment.</td></tr>}</tbody>
    </table></div>
  </>;
}

function AlertRows({ alerts }: { alerts: Alert[] }) {
  const iconFor = (level: Alert["level"]) => level === "critical" ? TriangleAlert : level === "warning" ? Bell : Check;
  return <div className="divide-y divide-line">{alerts.map((alert) => {
    const Icon = iconFor(alert.level);
    return <div key={alert.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"><span className={`alert-icon alert-${alert.level}`}><Icon size={14} /></span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-medium text-slate-200">{alert.title}</p><span className="shrink-0 font-mono text-[10px] text-slate-600">{alert.time}</span></div><p className="mt-1 text-xs text-slate-500">{alert.detail}</p></div></div>;
  })}</div>;
}

export default function App() {
  const [view, setView] = useState<View>("overview");
  const [environment, setEnvironment] = useState<"dev" | "prod">("dev");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [dashboardError, setDashboardError] = useState("");
  const [settings, setSettings] = useState<Setting[]>([]);
  const [settingsError, setSettingsError] = useState("");
  const [draft, setDraft] = useState<SettingDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showSettingForm, setShowSettingForm] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [logTarget, setLogTarget] = useState<{ id: string; name: string; isPod: boolean } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refreshDashboard = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      setDashboard(await apiRequest<DashboardData>(`/api/dashboard?environment=${environment}`));
      setDashboardError("");
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Impossible de joindre l’API.");
    } finally { setRefreshing(false); }
  }, [environment]);

  const loadSettings = useCallback(async () => {
    try {
      setSettings((await apiRequest<{ data: Setting[] }>("/api/settings")).data);
      setSettingsError("");
    } catch (error) { setSettingsError(error instanceof Error ? error.message : "Impossible de charger les paramètres."); }
  }, []);

  useEffect(() => {
    void refreshDashboard();
    const timer = window.setInterval(() => void refreshDashboard(), 15000);
    return () => window.clearInterval(timer);
  }, [refreshDashboard]);
  useEffect(() => { if (view === "settings") void loadSettings(); }, [view, loadSettings]);

  function showNotice(message: string, tone: Notice["tone"] = "success") {
    setNotice({ message, tone });
    window.setTimeout(() => setNotice(null), 4200);
  }

  async function handleContainerAction(container: Container, action: "start" | "stop" | "restart" | "remove") {
    if (action === "remove" && !window.confirm(`Supprimer le conteneur ${container.name} ?`)) return;
    try {
      await apiRequest(`/api/containers/${container.id}/${action}?environment=${environment}`, { method: "POST" });
      await refreshDashboard();
      showNotice(`${container.name} · action ${action} exécutée.`);
    } catch (error) { showNotice(error instanceof Error ? error.message : "Action impossible.", "error"); }
  }

  async function handleScale(deployment: string, replicas: number) {
    try {
      await apiRequest(`/api/kubernetes/deployments/${deployment}/scale`, { method: "PUT", body: JSON.stringify({ replicas, environment }) });
      await refreshDashboard();
      showNotice(`Déploiement ${deployment} ajusté à ${replicas} réplicas.`);
    } catch (error) { showNotice(error instanceof Error ? error.message : "Mise à l’échelle impossible.", "error"); }
  }

  function editSetting(setting: Setting) {
    setDraft({ name: setting.name, type: setting.type, value: setting.value, active: setting.active });
    setEditingId(setting.id);
    setShowSettingForm(true);
  }
  function openNewSetting() { setDraft(emptyDraft); setEditingId(null); setShowSettingForm(true); }

  async function saveSetting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await apiRequest(editingId ? `/api/settings/${editingId}` : "/api/settings", { method: editingId ? "PUT" : "POST", body: JSON.stringify(draft) });
      await loadSettings();
      setShowSettingForm(false);
      showNotice(editingId ? "Paramètre mis à jour." : "Paramètre créé.");
    } catch (error) { showNotice(error instanceof Error ? error.message : "Enregistrement impossible.", "error"); }
  }

  async function removeSetting(setting: Setting) {
    if (!window.confirm(`Supprimer le paramètre « ${setting.name} » ?`)) return;
    try {
      await apiRequest(`/api/settings/${setting.id}`, { method: "DELETE" });
      await loadSettings();
      showNotice("Paramètre supprimé.");
    } catch (error) { showNotice(error instanceof Error ? error.message : "Suppression impossible.", "error"); }
  }

  async function testWebhook() {
    try {
      const result = await apiRequest<{ message: string }>("/api/monitoring/alerts/test", { method: "POST" });
      showNotice(result.message);
    } catch (error) { showNotice(error instanceof Error ? error.message : "Envoi du test impossible.", "error"); }
  }

  const runningContainers = dashboard?.containers.filter((container) => container.status === "running").length ?? 0;
  const runningPods = dashboard?.pods.filter((pod) => pod.status === "Running").length ?? 0;
  const activeServices = dashboard?.monitoring.services.filter((service) => service.status === "operational").length ?? 0;
  const title = navigation.find((item) => item.id === view)?.label ?? "Vue d’ensemble";

  function renderOverview() {
    if (!dashboard) return <LoadingState error={dashboardError} onRetry={() => void refreshDashboard(true)} />;
    const avgCpu = dashboard.metrics.reduce((sum, item) => sum + item.cpu, 0) / (dashboard.metrics.length || 1);
    return <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="section-eyebrow">NIGHTSHIFT / CONTROL NODE 001</p><h1 className="font-sans text-2xl font-semibold tracking-tight text-white sm:text-[30px]">Bonjour, opérateur<span className="text-accent">.</span></h1><p className="mt-2 text-sm text-slate-500">Voici l’état de votre infrastructure.</p></div><button type="button" className="button-secondary" disabled={refreshing} onClick={() => void refreshDashboard(true)}><RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Actualiser</button></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Disponibilité" value={`${activeServices}/${dashboard.monitoring.services.length}`} detail="services opérationnels" icon={ShieldCheck} trend="up" /><MetricCard label="Conteneurs actifs" value={`${runningContainers}/${dashboard.containers.length}`} detail="en cours d’exécution" icon={Box} /><MetricCard label="Pods actifs" value={`${runningPods}/${dashboard.pods.length}`} detail="dans le cluster démo" icon={Layers3} /><MetricCard label="CPU moyen · 24 h" value={`${avgCpu.toFixed(1)}%`} detail="tendance stable" icon={Cpu} trend="down" /></div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.9fr)]">
        <section className="panel-card"><div className="mb-3 flex items-start justify-between"><div><p className="panel-kicker">RESSOURCES / DERNIÈRES 24 H</p><h2 className="mt-1 text-sm font-semibold text-slate-200">CPU & mémoire</h2></div><div className="flex gap-4 font-mono text-[10px] text-slate-400"><span><i className="legend-dot bg-accent" />CPU</span><span><i className="legend-dot bg-slate-500" />RAM</span></div></div><Suspense fallback={<div className="chart-placeholder">Chargement du graphique…</div>}><ResourceChart data={dashboard.metrics} /></Suspense></section>
        <section className="panel-card"><div className="mb-5 flex items-center justify-between"><div><p className="panel-kicker">ÉTAT / SERVICES</p><h2 className="mt-1 text-sm font-semibold text-slate-200">Disponibilité</h2></div><span className="font-mono text-[10px] text-slate-500">DÉMO</span></div><div className="space-y-4">{dashboard.monitoring.services.map((service) => <div key={service.name} className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><span className={`service-pulse ${service.status === "operational" ? "pulse-ok" : "pulse-warn"}`} /><div className="min-w-0"><p className="truncate text-xs font-medium text-slate-300">{service.name}</p><p className="mt-1 font-mono text-[10px] text-slate-600">{service.uptime} uptime</p></div></div><span className="shrink-0 font-mono text-xs text-slate-400">{service.latency} ms</span></div>)}</div><div className="mt-5 border-t border-line pt-4"><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-xs text-slate-400"><Database size={14} /> MySQL · health check</span><StatusPill status={dashboard.database.status} /></div><div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[10px] text-slate-500"><span>{dashboard.database.latency ?? "—"} ms latence</span><span>{dashboard.database.connections ?? "—"} connexions</span><span>{dashboard.database.sizeMb ?? "—"} MB</span></div></div></section>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <section className="panel-card"><div className="mb-5 flex items-center justify-between"><div><p className="panel-kicker">RUNTIME / DOCKER</p><h2 className="mt-1 text-sm font-semibold text-slate-200">Conteneurs</h2></div><button type="button" className="text-xs text-slate-500 transition hover:text-white" onClick={() => setView("containers")}>Tout voir →</button></div><ContainerRows containers={dashboard.containers.slice(0, 3)} onAction={handleContainerAction} onLogs={(item) => setLogTarget({ id: item.id, name: item.name, isPod: false })} /></section>
        <section className="panel-card"><div className="mb-5 flex items-center justify-between"><div><p className="panel-kicker">CLUSTER / KUBERNETES</p><h2 className="mt-1 text-sm font-semibold text-slate-200">Pods récents</h2></div><button type="button" className="text-xs text-slate-500 transition hover:text-white" onClick={() => setView("kubernetes")}>Tout voir →</button></div><PodRows pods={dashboard.pods.slice(0, 3)} onScale={handleScale} onLogs={(pod) => setLogTarget({ id: pod.name, name: pod.name, isPod: true })} /></section>
      </div>
      <section className="panel-card mt-4"><div className="mb-5 flex items-center justify-between"><div><p className="panel-kicker">ÉVÉNEMENTS / DERNIÈRES ACTIVITÉS</p><h2 className="mt-1 text-sm font-semibold text-slate-200">Flux système</h2></div><button type="button" className="text-xs text-slate-500 transition hover:text-white" onClick={() => setView("monitoring")}>Monitoring →</button></div><AlertRows alerts={dashboard.monitoring.alerts.slice(0, 2)} /></section>
    </>;
  }

  function renderSettings() {
    return <>
      <SectionTitle eyebrow="CONFIGURATION / PRÉFÉRENCES" title="Paramètres" action={<button type="button" className="button-primary" onClick={openNewSetting}><Plus size={14} /> Nouveau paramètre</button>} />
      {settingsError && <p className="mb-4 rounded-md border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-300">{settingsError}</p>}
      <section className="panel-card p-0"><div className="table-scroll"><table className="data-table">
        <thead><tr><th>Nom</th><th>Type</th><th>Valeur</th><th>État</th><th>Actions</th></tr></thead>
        <tbody>{settings.map((setting) => <tr key={setting.id}><td className="font-medium text-slate-200">{setting.name}</td><td><span className="type-chip">{setting.type}</span></td><td className="max-w-[320px] truncate font-mono text-xs text-slate-500">{setting.type === "discord_webhook" ? "••••••••••••••••••••" : setting.value}</td><td><span className={setting.active ? "text-xs text-emerald-400" : "text-xs text-slate-600"}>{setting.active ? "Actif" : "Inactif"}</span></td><td><div className="flex items-center gap-3"><button type="button" className="text-xs text-slate-400 hover:text-white" onClick={() => editSetting(setting)}>Modifier</button><button type="button" className="text-slate-500 hover:text-red-400" aria-label={`Supprimer ${setting.name}`} onClick={() => void removeSetting(setting)}><Trash2 size={14} /></button></div></td></tr>)}
          {settings.length === 0 && <tr><td colSpan={5} className="py-12 text-center"><Settings size={19} className="mx-auto mb-2 text-slate-600" /><p className="text-sm text-slate-400">Aucun paramètre configuré</p><p className="mt-1 text-xs text-slate-600">Ajoutez un seuil, une alerte ou un webhook Discord.</p></td></tr>}</tbody>
      </table></div></section>
      <div className="mt-4 flex items-start gap-3 rounded-lg border border-line bg-panel/60 p-4"><CircleHelp size={15} className="mt-0.5 shrink-0 text-slate-500" /><p className="text-xs leading-relaxed text-slate-500">Les paramètres sont enregistrés dans MySQL. Les webhooks Discord doivent utiliser une URL HTTPS valide sur discord.com ou discordapp.com.</p></div>
    </>;
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand-lockup"><div className="brand-mark">n<span>.</span></div><div><p className="font-mono text-[13px] font-semibold tracking-[0.16em] text-white">nightshift</p><p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-slate-600">devops control</p></div></div>
      <div className="sidebar-label">WORKSPACE</div>
      <nav className="space-y-1" aria-label="Navigation principale">{navigation.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-label={label} title={label} className={`nav-item ${view === id ? "nav-item-active" : ""}`} onClick={() => setView(id)}><Icon size={16} strokeWidth={1.8} /><span>{label}</span>{id === "monitoring" && <span className="nav-count">3</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="cluster-card"><div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Cluster principal</span><span className="service-pulse pulse-ok" /></div><p className="mt-3 text-xs font-medium text-slate-300">local-dev-cluster</p><p className="mt-1 font-mono text-[10px] text-slate-600">3 nodes · Kubernetes demo</p></div><div className="user-card"><div className="user-avatar">O</div><div className="min-w-0 flex-1"><p className="text-xs font-medium text-slate-300">Opérateur local</p><p className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-600">admin local</p></div><Menu size={15} className="text-slate-600" /></div></div>
    </aside>
    <main className="main-column">
      <header className="topbar"><div className="flex min-w-0 items-center gap-3"><span className="hidden font-mono text-[10px] uppercase tracking-widest text-slate-600 sm:inline">SYSTÈME /</span><span className="truncate text-xs text-slate-400">{title}</span></div><div className="flex items-center gap-3 sm:gap-5"><div className="connection-indicator"><span className="service-pulse pulse-ok" /><span className="hidden sm:inline">système opérationnel</span></div><label className="environment-select"><span className="hidden text-[10px] uppercase tracking-wider text-slate-600 sm:inline">ENV</span><select aria-label="Environnement" value={environment} onChange={(event) => setEnvironment(event.target.value as "dev" | "prod")}><option value="dev">dev</option><option value="prod">prod</option></select><ChevronDown size={12} /></label><div className="topbar-avatar">EA</div></div></header>
      <div className="content-area">
        {dashboardError && dashboard && <div className="mb-4 flex items-center justify-between rounded-md border border-amber-900/50 bg-amber-950/20 px-4 py-2 text-xs text-amber-300"><span>API momentanément indisponible : {dashboardError}</span><button type="button" onClick={() => void refreshDashboard(true)}><RefreshCw size={13} /></button></div>}
        {view === "overview" && renderOverview()}
        {view === "containers" && (dashboard ? <><SectionTitle eyebrow="DOCKER / RUNTIME" title="Conteneurs" action={<span className="demo-badge">MODE DÉMO</span>} /><section className="panel-card"><ContainerRows containers={dashboard.containers} onAction={handleContainerAction} onLogs={(item) => setLogTarget({ id: item.id, name: item.name, isPod: false })} /></section><p className="mt-3 text-xs text-slate-600">Les actions modifient uniquement les données de démonstration ; aucun conteneur Docker n’est contrôlé.</p></> : <LoadingState error={dashboardError} onRetry={() => void refreshDashboard(true)} />)}
        {view === "kubernetes" && (dashboard ? <><SectionTitle eyebrow="CLUSTER / ORCHESTRATION" title="Kubernetes" action={<span className="demo-badge">MODE DÉMO</span>} /><section className="panel-card p-0"><PodRows pods={dashboard.pods} onScale={handleScale} onLogs={(pod) => setLogTarget({ id: pod.name, name: pod.name, isPod: true })} /></section><p className="mt-3 text-xs text-slate-600">Les opérations de scaling et les logs sont simulés et ne contactent aucun cluster.</p></> : <LoadingState error={dashboardError} onRetry={() => void refreshDashboard(true)} />)}
        {view === "monitoring" && (dashboard ? <>
          <SectionTitle eyebrow="OBSERVABILITÉ / SANTÉ" title="Monitoring" action={<span className="demo-badge">MODE DÉMO</span>} />
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]"><section className="panel-card"><p className="panel-kicker">HEALTH CHECKS</p><h2 className="mb-5 mt-1 text-sm font-semibold text-slate-200">Services surveillés</h2><div className="space-y-4">{dashboard.monitoring.services.map((service) => <div key={service.name} className="flex items-center justify-between border-b border-line pb-4 last:border-0 last:pb-0"><div><p className="text-sm text-slate-300">{service.name}</p><p className="mt-1 font-mono text-[10px] text-slate-600">Uptime {service.uptime} · {service.latency} ms</p></div><StatusPill status={service.status} /></div>)}</div></section><section className="panel-card"><div className="mb-5 flex items-center justify-between"><div><p className="panel-kicker">INCIDENTS / ALERTES</p><h2 className="mt-1 text-sm font-semibold text-slate-200">Activité récente</h2></div><Bell size={16} className="text-slate-500" /></div><AlertRows alerts={dashboard.monitoring.alerts} /></section></div>
          <section className="panel-card mt-4"><div className="mb-3"><p className="panel-kicker">MÉTRIQUES / RÉTENTION 24 H</p><h2 className="mt-1 text-sm font-semibold text-slate-200">CPU & RAM</h2></div><Suspense fallback={<div className="chart-placeholder">Chargement du graphique…</div>}><ResourceChart data={dashboard.metrics} /></Suspense></section>
          <section className="panel-card mt-4 flex flex-wrap items-center justify-between gap-4"><div><p className="panel-kicker">NOTIFICATIONS / DISCORD</p><h2 className="mt-1 text-sm font-semibold text-slate-200">Webhook d’alerte</h2><p className="mt-1 text-xs text-slate-500">Configurez un webhook actif dans les paramètres avant le test.</p></div><button type="button" className="button-primary" onClick={() => void testWebhook()}><Bell size={14} /> Tester le webhook</button></section>
        </> : <LoadingState error={dashboardError} onRetry={() => void refreshDashboard(true)} />)}
        {view === "settings" && renderSettings()}
        <footer className="page-footer"><span>NIGHTSHIFT / OPS DASHBOARD</span><span className="flex items-center gap-2"><Clock3 size={11} /> RÉTENTION MÉTRIQUES : 24 H <span className="text-slate-700">·</span> v1.0.0</span></footer>
      </div>
    </main>
    {notice && <div role="status" className={`toast-message ${notice.tone === "error" ? "toast-error" : ""}`}>{notice.tone === "success" ? <Check size={15} /> : <TriangleAlert size={15} />}{notice.message}<button type="button" aria-label="Fermer" onClick={() => setNotice(null)}><X size={14} /></button></div>}
    {showSettingForm && <div className="modal-backdrop" role="presentation" onClick={() => setShowSettingForm(false)}><section className="modal-panel max-w-lg" role="dialog" aria-modal="true" aria-labelledby="setting-title" onClick={(event) => event.stopPropagation()}>
      <div className="flex items-center justify-between border-b border-line px-5 py-4"><div><p className="panel-kicker">CONFIGURATION / MYSQL</p><h2 id="setting-title" className="mt-1 text-sm font-semibold text-white">{editingId ? "Modifier le paramètre" : "Créer un paramètre"}</h2></div><button type="button" className="icon-button" aria-label="Fermer" onClick={() => setShowSettingForm(false)}><X size={17} /></button></div>
      <form className="space-y-4 p-5" onSubmit={(event) => void saveSetting(event)}>
        <label className="form-field">Nom<input required maxLength={120} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Seuil CPU principal" /></label>
        <label className="form-field">Type<select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as SettingDraft["type"] })}><option value="alert">Alerte</option><option value="discord_webhook">Webhook Discord</option><option value="metric_threshold">Seuil métrique</option><option value="service">Service</option></select></label>
        <label className="form-field">Valeur<input required type={draft.type === "discord_webhook" ? "password" : "text"} value={draft.value} onChange={(event) => setDraft({ ...draft, value: event.target.value })} placeholder={draft.type === "discord_webhook" ? "https://discord.com/api/webhooks/…" : "ex. 80"} /></label>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-400"><input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} /> Paramètre actif</label>
        <div className="flex justify-end gap-2 border-t border-line pt-4"><button type="button" className="button-secondary" onClick={() => setShowSettingForm(false)}>Annuler</button><button type="submit" className="button-primary"><Check size={14} /> Enregistrer</button></div>
      </form>
    </section></div>}
    {logTarget && <LogsModal containerId={logTarget.id} containerName={logTarget.name} environment={environment} isPod={logTarget.isPod} onClose={() => setLogTarget(null)} />}
  </div>;
}

function LoadingState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return <div className="panel-card flex min-h-64 flex-col items-center justify-center text-center"><HardDrive size={22} className="mb-3 text-slate-600" /><p className="text-sm text-slate-300">{error ? "Connexion API indisponible" : "Chargement de l’infrastructure…"}</p>{error && <><p className="mt-2 max-w-md text-xs text-slate-500">{error}</p><button type="button" className="button-secondary mt-4" onClick={onRetry}><RefreshCw size={13} /> Réessayer</button></>}</div>;
}
