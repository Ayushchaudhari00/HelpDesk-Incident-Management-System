import { useEffect, useState } from "react";
import api, { errorText } from "../api";
import { EmptyState, ErrorMessage, FieldError, LoadingState, PageHeading, Toast } from "../components/Primitives";
import { formatDate, initials } from "../utils";

const ROLES = ["EMPLOYEE", "TECH_SUPPORT", "ADMIN"];

export default function Users() {
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "EMPLOYEE" });
  const [refresh, setRefresh] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api.get("/users")
      .then(({ data }) => { if (!cancelled) { setUsers(Array.isArray(data) ? data : []); setError(""); } })
      .catch((requestError) => { if (!cancelled) setError(errorText(requestError)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refresh]);

  useEffect(() => {
    if (!panelOpen && !credentials) return undefined;
    function handleKeyDown(event) {
      if (event.key !== "Escape") return;
      if (credentials) {
        setCredentials(null);
        setCopied(false);
        setCopyError("");
      } else if (!busy) {
        setPanelOpen(false);
        setFormError("");
        setFieldErrors({});
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [panelOpen, credentials, busy]);

  function update(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  function closePanel() {
    if (busy) return;
    setPanelOpen(false);
    setFormError("");
    setFieldErrors({});
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setFormError("");
    setFieldErrors({});
    try {
      await api.post("/users", form);
      setCredentials({ email: form.email, password: form.password });
      setCopied(false);
      setCopyError("");
      setForm({ name: "", email: "", password: "", role: "EMPLOYEE" });
      setPanelOpen(false);
      setRefresh((value) => value + 1);
    } catch (requestError) {
      const nextFieldErrors = requestError.response?.data?.fieldErrors || {};
      setFieldErrors(nextFieldErrors);
      setFormError(Object.keys(nextFieldErrors).length ? "" : errorText(requestError));
    } finally {
      setBusy(false);
    }
  }

  async function copyCredentials() {
    try {
      await navigator.clipboard.writeText(`Email: ${credentials.email}\nTemporary password: ${credentials.password}`);
      setCopied(true);
      setCopyError("");
    } catch {
      setCopyError("Clipboard access is unavailable. Select and copy the credentials above.");
    }
  }

  function dismissCredentials() {
    setCredentials(null);
    setCopied(false);
    setCopyError("");
  }

  return <>
    <PageHeading eyebrow="ADMINISTRATION" title="Users" description="Manage workspace access and support roles." action={<button className="btn" onClick={() => setPanelOpen(true)}><span className="button-plus">+</span> Create user</button>} />
    <section className="panel users-list-panel users-directory">
      <div className="panel-heading"><div><h2>Team members</h2><p>People with access to the support workspace</p></div>{users && <span className="panel-count">{users.length} users</span>}</div>
      <ErrorMessage>{error}</ErrorMessage>
      {loading ? <LoadingState label="Loading users..." /> : !users && error ? null : !users?.length ? <EmptyState title="No users yet" description="Create the first user to get your support team started." action={<button className="btn secondary" onClick={() => setPanelOpen(true)}>Create user</button>} /> : <div className="table-wrap"><table className="data-table users-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Account</th><th>Created</th></tr></thead><tbody>{users.map((person) => <tr key={person.id}><td><div className="user-name-cell"><span className="tiny-avatar">{initials(person.name || person.email)}</span><strong>{person.name}</strong></div></td><td className="user-email-cell">{person.email}</td><td><span className={`role-pill role-${person.role?.toLowerCase()}`}><span className="badge-dot" />{person.role?.replace("_", " ")}</span></td><td><span className={`account-state${person.active ? " is-active" : ""}`}><span />{person.active ? "Active" : "Inactive"}</span></td><td className="date-cell">{formatDate(person.createdAt)}</td></tr>)}</tbody></table></div>}
    </section>

    {panelOpen && <div className="drawer-layer">
      <button className="drawer-backdrop" aria-label="Close create user panel" onClick={closePanel} />
      <aside className="user-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <div className="drawer-heading"><div><div className="eyebrow">USER MANAGEMENT</div><h2 id="drawer-title">Create user</h2><p>Add a teammate to your support workspace.</p></div><button className="icon-button drawer-close" onClick={closePanel} aria-label="Close create user panel">×</button></div>
        <form className="drawer-form" onSubmit={submit}>
          <ErrorMessage>{formError}</ErrorMessage>
          <label className="field-label" htmlFor="user-name">Full name</label><input className="in" id="user-name" autoFocus autoComplete="name" required value={form.name} onChange={update("name")} placeholder="e.g. Alex Morgan" /><FieldError errors={fieldErrors} field="name" />
          <label className="field-label" htmlFor="user-email">Email address</label><input className="in" id="user-email" type="email" autoComplete="email" required value={form.email} onChange={update("email")} placeholder="alex@company.com" /><FieldError errors={fieldErrors} field="email" />
          <label className="field-label" htmlFor="user-password">Temporary password</label><input className="in" id="user-password" type="password" autoComplete="new-password" minLength="8" required value={form.password} onChange={update("password")} placeholder="At least 8 characters" /><FieldError errors={fieldErrors} field="password" /><span className="field-hint">Share this password with the user securely.</span>
          <label className="field-label" htmlFor="user-role">Role</label><select className="in" id="user-role" value={form.role} onChange={update("role")}>{ROLES.map((role) => <option key={role} value={role}>{role.replace("_", " ")}</option>)}</select><span className="field-hint">Roles determine which tickets and tools a user can access.</span>
          <div className="drawer-actions"><button type="button" className="btn secondary" onClick={closePanel} disabled={busy}>Cancel</button><button className="btn" disabled={busy}>{busy ? "Creating user..." : "Create user"}</button></div>
        </form>
      </aside>
    </div>}

    {credentials && <div className="dialog-backdrop"><section className="credentials-dialog" role="alertdialog" aria-modal="true" aria-labelledby="credentials-title" aria-describedby="credentials-description">
      <div className="credentials-icon">✓</div><div className="eyebrow">USER CREATED</div><h2 id="credentials-title">Share these credentials</h2><p id="credentials-description">Copy them now and give them to the new user securely. The password will not be shown again after you close this message.</p>
      <div className="credentials-box"><span>Email address</span><strong>{credentials.email}</strong><span>Temporary password</span><strong className="credential-password">{credentials.password}</strong></div>
      {copyError && <div className="alert-error" role="alert">{copyError}</div>}
      <button className="btn secondary credentials-copy" onClick={copyCredentials}>{copied ? "Copied" : "Copy credentials"}</button>
      <button className="btn credentials-done" onClick={dismissCredentials}>Done</button>
    </section></div>}
    <Toast message={copied ? "Credentials copied to clipboard." : ""} tone="success" />
  </>;
}
