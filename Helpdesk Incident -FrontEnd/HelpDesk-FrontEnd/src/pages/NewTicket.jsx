import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { errorText } from "../api";
import { BackLink, ErrorMessage, FieldError, PageHeading } from "../components/Primitives";

export default function NewTicket() {
  const [form, setForm] = useState({ title: "", description: "", priority: "MEDIUM", category: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  function update(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setFieldErrors({});
    try {
      const { data } = await api.post("/ticket", form);
      navigate(`/tickets/${data.id}`);
    } catch (requestError) {
      const nextFieldErrors = requestError.response?.data?.fieldErrors || {};
      setFieldErrors(nextFieldErrors);
      setError(Object.keys(nextFieldErrors).length ? "" : errorText(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <BackLink />
      <PageHeading eyebrow="SUPPORT REQUEST" title="Create a ticket" description="Tell us what you need help with. Your support team will take it from here." />
      <form className="form-card ticket-form" onSubmit={submit}>
        <div className="form-card-heading"><div className="form-card-symbol"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8v8m-4-4h8M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" /></svg></div><div><h2>Request details</h2><p>Share enough detail to help the right person resolve your request.</p></div></div>
        <ErrorMessage>{error}</ErrorMessage>
        <div className="field-grid">
          <div className="form-field full-field"><label className="field-label" htmlFor="ticket-title">Title <span>*</span></label><input className="in" id="ticket-title" required maxLength="160" placeholder="Briefly describe the issue" value={form.title} onChange={update("title")} /><FieldError errors={fieldErrors} field="title" /></div>
          <div className="form-field full-field"><label className="field-label" htmlFor="ticket-description">Description</label><textarea className="in textarea" id="ticket-description" rows="5" placeholder="Add details that will help us understand and resolve your request..." value={form.description} onChange={update("description")} /><FieldError errors={fieldErrors} field="description" /><span className="field-hint">Include any steps to reproduce the issue or details that might help.</span></div>
          <div className="form-field"><label className="field-label" htmlFor="ticket-category">Category</label><input className="in" id="ticket-category" placeholder="e.g. Hardware, Access" value={form.category} onChange={update("category")} /><FieldError errors={fieldErrors} field="category" /></div>
          <div className="form-field"><label className="field-label" htmlFor="ticket-priority">Priority</label><select className="in" id="ticket-priority" value={form.priority} onChange={update("priority")}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select><span className="field-hint">The support team may adjust priority if needed.</span></div>
        </div>
        <div className="form-actions"><BackLink to="/tickets" children="Cancel" /><button className="btn" disabled={busy}>{busy ? "Submitting..." : "Submit request"}<span>→</span></button></div>
      </form>
    </>
  );
}
