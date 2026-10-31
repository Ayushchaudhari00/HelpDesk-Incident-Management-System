import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { errorText, getUser } from "../api";
import { BackLink, ErrorMessage, FieldError, LoadingState, TicketBadges, Toast } from "../components/Primitives";
import { formatDate, initials } from "../utils";

const EDITABLE_FIELDS = ["title", "description", "priority", "category"];
const STATUS_STEPS = ["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getUser();
  const staff = user?.role === "TECH_SUPPORT" || user?.role === "ADMIN";
  const admin = user?.role === "ADMIN";
  const [ticket, setTicket] = useState(null);
  const [loadedId, setLoadedId] = useState(null);
  const [history, setHistory] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [comment, setComment] = useState("");
  const [internal, setInternal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editErrors, setEditErrors] = useState({});
  const [editForm, setEditForm] = useState({ title: "", description: "", priority: "MEDIUM", category: "" });
  const [agentId, setAgentId] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [ticketResponse, historyResponse, usersResponse] = await Promise.all([
          api.get(`/ticket/${id}`),
          staff ? api.get(`/ticket/${id}/history`) : Promise.resolve({ data: [] }),
          admin ? api.get("/users") : Promise.resolve({ data: [] }),
        ]);
        if (!cancelled) {
          setTicket(ticketResponse.data);
          setLoadedId(id);
          setHistory(Array.isArray(historyResponse.data) ? historyResponse.data : []);
          setAgents((Array.isArray(usersResponse.data) ? usersResponse.data : []).filter((person) => person.role === "TECH_SUPPORT" && person.active));
          setError("");
          setActionError("");
        }
      } catch (requestError) {
        if (!cancelled) {
          setTicket(null);
          setLoadedId(id);
          setError(errorText(requestError));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id, staff, admin, refresh]);

  async function perform(request) {
    setBusy(true);
    setActionError("");
    try {
      await request();
      setEditing(false);
      setRefresh((value) => value + 1);
      return true;
    } catch (requestError) {
      const nextFieldErrors = requestError.response?.data?.fieldErrors || {};
      setActionError(Object.keys(nextFieldErrors).length ? "" : errorText(requestError));
      setEditErrors(nextFieldErrors);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function submitComment(event) {
    event.preventDefault();
    if (!comment.trim()) return;
    const posted = await perform(() => api.post(`/ticket/${id}/comments`, { text: comment.trim(), internal }));
    if (posted) {
      setComment("");
      setInternal(false);
    }
  }

  async function saveChanges(event) {
    event.preventDefault();
    const changed = Object.fromEntries(EDITABLE_FIELDS.filter((field) => editForm[field] !== (ticket[field] || "")).map((field) => [field, editForm[field]]));
    if (!Object.keys(changed).length) {
      setEditing(false);
      return;
    }
    await perform(() => api.put(`/ticket/${id}`, changed));
  }

  function startEditing() {
    setEditForm(Object.fromEntries(EDITABLE_FIELDS.map((field) => [field, ticket[field] || ""])));
    setEditErrors({});
    setEditing(true);
    setActionError("");
  }

  function changeStatus(status) {
    return perform(() => api.put(`/ticket/${id}/status`, null, { params: { status } }));
  }

  const assignToMe = () => perform(() => api.put(`/ticket/${id}/assign`));
  const assignAgent = (event) => {
    event.preventDefault();
    if (!agentId) {
      setActionError("Choose an active tech support user to assign this ticket to.");
      return;
    }
    return perform(() => api.put(`/ticket/${id}/assign`, null, { params: { agentId } }));
  };

  async function deleteTicket() {
    if (!window.confirm("Delete this ticket and all its comments? This cannot be undone.")) return;
    setBusy(true);
    setActionError("");
    try {
      await api.delete(`/ticket/${id}`);
      navigate("/tickets", { replace: true });
    } catch (requestError) {
      setActionError(errorText(requestError));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingState label="Loading ticket..." />;
  if (loadedId !== id) return <LoadingState label="Loading ticket..." />;
  if (!ticket) return <><BackLink /><div className="not-found-panel"><div className="eyebrow">TICKET UNAVAILABLE</div><h1>Unable to load this ticket</h1><ErrorMessage>{error}</ErrorMessage><Link className="btn alt" to="/tickets">Return to tickets</Link></div></>;

  const canAssign = staff && (ticket.status === "OPEN" || ticket.status === "REOPENED");
  const comments = Array.isArray(ticket.comments) ? ticket.comments.filter((item) => staff || !item.internal) : [];
  const currentStep = ticket.status === "REOPENED" ? 0 : Math.max(0, STATUS_STEPS.indexOf(ticket.status));
  const editField = (field) => (event) => setEditForm((current) => ({ ...current, [field]: event.target.value }));

  return <>
    <nav className="ticket-breadcrumb" aria-label="Breadcrumb"><Link to="/tickets">Tickets</Link><span aria-hidden="true">/</span><span aria-current="page">{ticket.title}</span></nav>
    <section className="ticket-header-card">
      <div className="ticket-header-main">
        <div className="ticket-header-copy">
          <div className="eyebrow">TICKET {ticket.id}</div>
          <h1>{ticket.title}</h1>
          <div className="ticket-header-badges"><TicketBadges status={ticket.status} priority={ticket.priority} slaBreached={ticket.slaBreached} />{ticket.status === "REOPENED" && <span className="reopened-label">Reopened</span>}</div>
          <div className="ticket-header-meta"><span>Created by <strong>{ticket.createdBy}</strong></span><span>{formatDate(ticket.createdAt)}</span><span>{ticket.category || "General"}</span></div>
        </div>
        <div className="heading-actions">{admin && <button className="btn danger-outline" disabled={busy} onClick={deleteTicket}>Delete</button>}<button className="btn secondary" disabled={busy || editing} onClick={startEditing}>Edit ticket</button></div>
      </div>
      <ol className="status-progress" aria-label={`Ticket progress: ${ticket.status.replace("_", " ")}`}>
        {STATUS_STEPS.map((step, index) => <li key={step} className={`progress-step${index < currentStep ? " complete" : ""}${index === currentStep ? " current" : ""}`}>
          <span className="progress-node">{index < currentStep ? "✓" : index + 1}</span>
          <span className="progress-label">{step.replace("_", " ")}</span>
        </li>)}
      </ol>
    </section>
    <Toast message={actionError} tone="danger" />
    <div className="detail-grid">
      <div className="detail-main">
        {editing ? <form className="panel edit-panel" onSubmit={saveChanges}>
          <div className="panel-heading"><div><h2>Edit request</h2><p>Only changed fields will be saved.</p></div></div>
          <label className="field-label" htmlFor="edit-title">Title</label><input className="in" id="edit-title" required value={editForm.title} onChange={editField("title")} /><FieldError errors={editErrors} field="title" />
          <label className="field-label" htmlFor="edit-description">Description</label><textarea className="in textarea" id="edit-description" rows="4" value={editForm.description} onChange={editField("description")} /><FieldError errors={editErrors} field="description" />
          <div className="field-grid">
            <div className="form-field"><label className="field-label" htmlFor="edit-priority">Priority</label><select className="in" id="edit-priority" value={editForm.priority} onChange={editField("priority")}>{["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((value) => <option key={value}>{value}</option>)}</select><FieldError errors={editErrors} field="priority" /></div>
            <div className="form-field"><label className="field-label" htmlFor="edit-category">Category</label><input className="in" id="edit-category" value={editForm.category} onChange={editField("category")} /><FieldError errors={editErrors} field="category" /></div>
          </div>
          <div className="form-actions"><button type="button" className="btn alt" onClick={() => setEditing(false)}>Cancel</button><button className="btn" disabled={busy}>{busy ? "Saving..." : "Save changes"}</button></div>
        </form> : <section className="panel ticket-overview">
          <p className="ticket-description">{ticket.description || "No description was provided."}</p>
          <div className="ticket-facts">
            <div><span>Category</span><strong>{ticket.category || "General"}</strong></div>
            <div><span>Created by</span><strong>{ticket.createdBy}</strong></div>
            <div><span>Assigned to</span><strong>{ticket.assignedTo || "Unassigned"}</strong></div>
            <div><span>SLA deadline</span><strong>{formatDate(ticket.slaDueAt)}</strong></div>
          </div>
          {(staff || ticket.status === "RESOLVED" || ticket.status === "CLOSED") && <div className="ticket-actions">
            {canAssign && !admin && <button className="btn" disabled={busy} onClick={assignToMe}>Assign to me</button>}
            {canAssign && admin && <form className="assign-form" onSubmit={assignAgent}><label className="sr-only" htmlFor="assign-agent">Assign to support agent</label><select className="in" id="assign-agent" value={agentId} onChange={(event) => setAgentId(event.target.value)} required><option value="">Choose an agent</option>{agents.map((agent) => <option value={agent.email} key={agent.id}>{agent.name} · {agent.email}</option>)}</select><button className="btn" disabled={busy || !agents.length}>{agents.length ? "Assign ticket" : "No active agents"}</button></form>}
            {staff && ticket.status === "ASSIGNED" && <button className="btn" disabled={busy} onClick={() => changeStatus("IN_PROGRESS")}>Start work</button>}
            {staff && ticket.status === "REOPENED" && <button className="btn" disabled={busy} onClick={() => changeStatus("IN_PROGRESS")}>Start work</button>}
            {staff && ticket.status === "IN_PROGRESS" && <button className="btn" disabled={busy} onClick={() => changeStatus("RESOLVED")}>Resolve ticket</button>}
            {staff && ticket.status === "RESOLVED" && <button className="btn" disabled={busy} onClick={() => changeStatus("CLOSED")}>Close ticket</button>}
            {(ticket.status === "RESOLVED" || ticket.status === "CLOSED") && <button className="btn alt" disabled={busy} onClick={() => perform(() => api.put(`/ticket/${id}/reopen`))}>Reopen request</button>}
          </div>}
        </section>}

        <section className="panel comments-panel">
          <div className="panel-heading"><div><h2>Conversation</h2><p>Updates and notes about this request</p></div><span className="panel-count">{comments.length} {comments.length === 1 ? "message" : "messages"}</span></div>
          {comments.length ? <div className="comment-list">{comments.map((item) => <article className={`comment-item${item.internal ? " internal-comment" : ""}`} key={item.id}>
            <div className="comment-avatar">{initials(item.author)}</div><div className="comment-body"><div className="comment-meta"><strong>{item.author}</strong><time>{formatDate(item.createdAt)}</time></div>{item.internal && <span className="internal-note-label">Internal note, hidden from employees</span>}<p>{item.text}</p></div>
          </article>)}</div> : <div className="comments-empty">No updates yet. Add a comment to start the conversation.</div>}
          <form className="comment-form" onSubmit={submitComment}><label className="field-label" htmlFor="comment">Add a comment</label><textarea className="in textarea" id="comment" rows="3" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Write a comment..." required />
            <div className="comment-controls">{staff && <label className="checkbox-label"><input type="checkbox" checked={internal} onChange={(event) => setInternal(event.target.checked)} /> Internal note</label>}<button className="btn" disabled={busy || !comment.trim()}>{busy ? "Posting..." : "Post comment"}<span>→</span></button></div>
          </form>
        </section>
      </div>
      {staff && <aside className="panel history-panel"><div className="panel-heading"><div><h2>Activity</h2><p>Ticket history</p></div></div>
        {history.length ? <div className="timeline">{history.map((event) => <div className="timeline-item" key={event.id}><span className="timeline-node" /><div><strong>{event.action.replace("_", " ")}</strong>{event.newValue && <span className="timeline-value">{event.newValue}</span>}<span className="timeline-by">by {event.performedBy}</span><time>{formatDate(event.timestamp)}</time></div></div>)}</div> : <p className="muted">No activity recorded yet.</p>}
      </aside>}
    </div>
  </>;
}
