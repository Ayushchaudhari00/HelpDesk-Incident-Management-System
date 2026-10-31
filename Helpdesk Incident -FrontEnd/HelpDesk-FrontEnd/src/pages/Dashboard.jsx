import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorText } from "../api";
import { EmptyState, ErrorMessage, LoadingState, PageHeading } from "../components/Primitives";

const STATUSES = ["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED", "REOPENED"];
const PRIORITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

function MetricCard({ label, value, detail, tone }) {
  return <article className="metric-card"><span className={`metric-dot ${tone}`} /><div className="metric-label">{label}</div><strong className="metric-value">{value ?? 0}</strong><div className="metric-detail">{detail}</div></article>;
}

function Distribution({ title, values, order, className }) {
  const max = Math.max(1, ...order.map((key) => values?.[key] || 0));
  return <section className="panel distribution-panel"><div className="panel-heading"><div><h2>{title}</h2><p>Current ticket distribution</p></div></div><div className="distribution-list">{order.map((key) => {
    const count = values?.[key] || 0;
    return <div className="distribution-row" key={key}><div className="distribution-label"><span className={`legend-dot ${className}-${key.toLowerCase()}`} />{key.replace("_", " ")}<strong>{count}</strong></div><div className="bar-track"><span className={`${className}-bar ${className}-${key.toLowerCase()}`} style={{ width: `${Math.max(count > 0 ? 5 : 0, count / max * 100)}%` }} /></div></div>;
  })}</div></section>;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get("/dashboard/stats")
      .then(({ data }) => { if (!cancelled) { setStats(data); setError(""); } })
      .catch((requestError) => { if (!cancelled) setError(errorText(requestError)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return <>
    <PageHeading eyebrow="OVERVIEW" title="Good day, admin" description="Here’s what’s happening across your support team." action={<Link className="btn alt" to="/tickets">View tickets <span>→</span></Link>} />
    <ErrorMessage>{error}</ErrorMessage>
    {loading ? <LoadingState label="Loading dashboard..." /> : stats && <>
      <section className="metrics-grid">
        <MetricCard label="Total tickets" value={stats.totalTickets} detail="Across all statuses" tone="teal" />
        <MetricCard label="SLA breached" value={stats.slaBreached} detail="Needs attention" tone="red" />
        <MetricCard label="Open & active" value={(stats.byStatus?.OPEN || 0) + (stats.byStatus?.ASSIGNED || 0) + (stats.byStatus?.IN_PROGRESS || 0) + (stats.byStatus?.REOPENED || 0)} detail="Requests in progress" tone="blue" />
        <MetricCard label="Resolved" value={stats.byStatus?.RESOLVED || 0} detail="Awaiting closure" tone="green" />
      </section>
      <section className="dashboard-grid">
        <Distribution title="By status" values={stats.byStatus} order={STATUSES} className="status" />
        <Distribution title="By priority" values={stats.byPriority} order={PRIORITIES} className="priority" />
      </section>
      <section className="panel agent-panel">
        <div className="panel-heading"><div><h2>Tickets per agent</h2><p>Work assigned across your support team</p></div><span className="panel-count">{Object.keys(stats.ticketsPerAgent || {}).length} agents</span></div>
        {Object.keys(stats.ticketsPerAgent || {}).length === 0 ? <EmptyState title="No assigned tickets yet" description="Tickets assigned to support agents will appear here." /> : <div className="table-wrap"><table className="data-table"><thead><tr><th>Agent</th><th>Assigned tickets</th><th>Share of all tickets</th></tr></thead><tbody>{Object.entries(stats.ticketsPerAgent).sort(([, a], [, b]) => b - a).map(([agent, count]) => <tr key={agent}><td><span className="assignee-cell"><span className="tiny-avatar">{agent.slice(0, 1).toUpperCase()}</span>{agent}</span></td><td><strong>{count}</strong></td><td><div className="agent-share"><span className="bar-track"><span className="agent-bar" style={{ width: `${stats.totalTickets ? Math.min(100, count / stats.totalTickets * 100) : 0}%` }} /></span><span>{stats.totalTickets ? Math.round(count / stats.totalTickets * 100) : 0}%</span></div></td></tr>)}</tbody></table></div>}
      </section>
    </>}
  </>;
}
