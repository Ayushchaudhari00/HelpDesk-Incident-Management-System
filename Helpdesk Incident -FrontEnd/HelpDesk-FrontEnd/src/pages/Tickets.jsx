import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorText, getUser } from "../api";
import { EmptyState, ErrorMessage, PageHeading, TicketBadges, TicketTableSkeleton } from "../components/Primitives";
import { formatDate, formatRelativeTime, initials } from "../utils";

const STATUSES = ["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED", "REOPENED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function Tickets() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    let cancelled = false;
    const params = { page, size: 10 };
    if (status) params.status = status;
    if (priority) params.priority = priority;
    if (keyword.trim()) params.keyword = keyword.trim();
    api.get("/ticket", { params })
      .then(({ data: pageData }) => {
        if (!cancelled) {
          setData(pageData);
          setError("");
        }
      })
      .catch((requestError) => {
        if (!cancelled) setError(errorText(requestError));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [status, priority, keyword, page]);

  function filter(setter) {
    return (event) => {
      setter(event.target.value);
      setPage(0);
    };
  }

  const tickets = data?.content || [];
  const admin = user?.role === "ADMIN";
  const total = data?.totalElements ?? 0;
  const start = total ? page * 10 + 1 : 0;
  const end = Math.min(page * 10 + tickets.length, total);
  const hasFilters = Boolean(keyword || status || priority);

  function clearFilters() {
    setKeyword("");
    setStatus("");
    setPriority("");
    setPage(0);
  }

  return (
    <>
      <PageHeading eyebrow={admin ? "ADMINISTRATION" : "YOUR SUPPORT"} title="Tickets" description={admin ? "A clear view of every request across your team." : "Track requests and keep your work moving."} action={<div className="ticket-heading-actions"><span className="total-count">{total} total</span><Link className="btn" to="/tickets/new"><span className="button-plus">+</span> New ticket</Link></div>} />
      <section className="ticket-section">
        <div className="section-heading"><div><h2>All tickets</h2><p>Search and filter your support requests</p></div></div>
        <div className="filters filter-card">
          <label className="search-field"><span className="search-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.2 4.2" /></svg></span><input className="in" aria-label="Search tickets by title" placeholder="Search by title..." value={keyword} onChange={filter(setKeyword)} /></label>
          <label className="filter-select"><span className="sr-only">Filter by status</span><select className="in" value={status} onChange={filter(setStatus)}><option value="">All statuses</option>{STATUSES.map((value) => <option key={value} value={value}>{value.replace("_", " ")}</option>)}</select></label>
          <label className="filter-select"><span className="sr-only">Filter by priority</span><select className="in" value={priority} onChange={filter(setPriority)}><option value="">All priorities</option>{PRIORITIES.map((value) => <option key={value} value={value}>{value} priority</option>)}</select></label>
          {hasFilters && <button className="btn ghost clear-filters" onClick={clearFilters}>Clear filters</button>}
        </div>
        <ErrorMessage>{error}</ErrorMessage>
        {loading ? <TicketTableSkeleton /> : !data && error ? null : tickets.length === 0 ? (
          <EmptyState title="No tickets found" description={hasFilters ? "Try changing or clearing your filters." : "When you raise a request, it will show up here."} action={hasFilters ? <button className="btn secondary" onClick={clearFilters}>Clear filters</button> : <Link className="btn secondary" to="/tickets/new">Create a ticket</Link>} />
        ) : (
          <>
            <div className="table-wrap ticket-table-wrap"><table className="data-table ticket-table"><thead><tr><th>Request</th><th>Status</th><th>Priority</th><th>Assignee</th><th>SLA</th></tr></thead><tbody>
              {tickets.map((ticket) => <tr key={ticket.id}>
                <td><Link className="ticket-title-link" to={`/tickets/${ticket.id}`}>{ticket.title}</Link><span className="table-subline">{ticket.category || "General"} · {ticket.createdBy}</span></td>
                <td><TicketBadges status={ticket.status} /></td>
                <td><TicketBadges priority={ticket.priority} /></td>
                <td>{ticket.assignedTo ? <span className="assignee-cell"><span className="tiny-avatar">{initials(ticket.assignedTo)}</span><span className="assignee-email">{ticket.assignedTo}</span></span> : <span className="muted">Unassigned</span>}</td>
                <td>{ticket.slaBreached ? <span className="sla-overdue"><span className="badge-dot" />Overdue</span> : <span className="sla-time" title={formatDate(ticket.slaDueAt)}>{formatRelativeTime(ticket.slaDueAt)}</span>}</td>
              </tr>)}
            </tbody></table></div>
            <div className="pagination"><span>Showing <strong>{start} to {end}</strong> of <strong>{total}</strong></span><div className="pagination-controls"><button className="btn secondary small-button" disabled={page <= 0} onClick={() => setPage((current) => current - 1)}>Previous</button><span>Page {page + 1} of {Math.max(data?.totalPages || 0, 1)}</span><button className="btn secondary small-button" disabled={page + 1 >= (data?.totalPages || 0)} onClick={() => setPage((current) => current + 1)}>Next</button></div></div>
          </>
        )}
      </section>
    </>
  );
}
