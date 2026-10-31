import { Link } from "react-router-dom";

export function Button({ variant = "primary", className = "", children, ...props }) {
  return <button className={`btn ${variant}${className ? ` ${className}` : ""}`} {...props}>{children}</button>;
}

function Field({ as: Tag = "input", id, label, error, helperText, children, className = "", ...props }) {
  const describedBy = [error ? `${id}-error` : null, helperText ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="form-field">
      <label className="field-label" htmlFor={id}>{label}</label>
      <Tag id={id} className={`in${className ? ` ${className}` : ""}`} aria-invalid={error ? "true" : undefined} aria-describedby={describedBy} {...props}>{children}</Tag>
      {error && <span className="field-error" id={`${id}-error`}>{error}</span>}
      {helperText && <span className="field-hint" id={`${id}-hint`}>{helperText}</span>}
    </div>
  );
}

export function Input(props) {
  return <Field {...props} />;
}

export function Select(props) {
  return <Field as="select" {...props} />;
}

export function Textarea(props) {
  return <Field as="textarea" {...props} />;
}

export function Badge({ children, tone = "neutral", className = "" }) {
  return <span className={`badge badge-${tone}${className ? ` ${className}` : ""}`}><span className="badge-dot" />{children}</span>;
}

export function Card({ as: Tag = "section", className = "", children, ...props }) {
  return <Tag className={`card${className ? ` ${className}` : ""}`} {...props}>{children}</Tag>;
}

export function Spinner({ label = "Loading..." }) {
  return <span className="spinner" role="status"><span className="sr-only">{label}</span></span>;
}

export function Skeleton({ className = "", ...props }) {
  return <span className={`skeleton${className ? ` ${className}` : ""}`} aria-hidden="true" {...props} />;
}

export function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p className="heading-description">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function LoadingState({ label = "Loading..." }) {
  return <div className="state-card"><Spinner label={label} />{label}</div>;
}

export function TicketTableSkeleton({ rows = 6 }) {
  return (
    <div className="table-wrap">
      <table className="data-table" aria-label="Loading tickets">
        <thead><tr><th>Request</th><th>Status</th><th>Priority</th><th>Assignee</th><th>SLA</th></tr></thead>
        <tbody>{Array.from({ length: rows }, (_, index) => (
          <tr key={index} aria-hidden="true">
            <td><Skeleton className="skeleton-ticket" /><Skeleton className="skeleton-meta" /></td>
            <td><Skeleton className="skeleton-badge" /></td>
            <td><Skeleton className="skeleton-badge" /></td>
            <td><Skeleton className="skeleton-assignee" /></td>
            <td><Skeleton className="skeleton-date" /></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

export function ErrorMessage({ children }) {
  return children ? <div className="alert-error" role="alert">{children}</div> : null;
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8l-5 2V6a2 2 0 0 1 2-2Zm3 5h8m-8 4h5" /></svg></div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function TicketBadges({ status, priority, slaBreached }) {
  return (
    <div className="badge-row">
      {status && <span className={`chip badge-status ${status}`}><span className="badge-dot" />{status.replace("_", " ")}</span>}
      {priority && <span className={`chip badge-priority ${priority}`}><span className="badge-dot" />{priority} priority</span>}
      {slaBreached && <span className="chip breach-chip"><span className="badge-dot" />SLA breached</span>}
    </div>
  );
}

export function BackLink({ to = "/tickets", children = "Back to tickets", className = "" }) {
  return <Link className={`back-link${className ? ` ${className}` : ""}`} to={to}>{children}</Link>;
}

export function FieldError({ errors, field }) {
  return errors?.[field] ? <span className="field-error">{errors[field]}</span> : null;
}

export function Toast({ message, tone = "info" }) {
  if (!message) return null;
  return <div className={`toast toast-${tone}`} role="status" aria-live="polite">{message}</div>;
}

export function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", onConfirm, onCancel, danger = false }) {
  if (!open) return null;
  return (
    <div className="dialog-backdrop">
      <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description">
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-description">{message}</p>
        <div className="dialog-actions">
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </section>
    </div>
  );
}
