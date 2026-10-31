import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api, { errorText } from "../api";
import { ErrorMessage } from "../components/Primitives";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(data.user.role === "ADMIN" ? "/dashboard" : "/tickets", { replace: true });
    } catch (requestError) {
      setError(errorText(requestError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-story">
        <div className="brand brand-light"><span className="brand-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13.5v-2a8 8 0 0 1 16 0v2M4 13.5H3v3a2 2 0 0 0 2 2h1v-5H4Zm16 0h1v3a2 2 0 0 1-2 2h-1v-5h2ZM9 19h6" /></svg></span><span>Helpdesk</span></div>
        <div className="story-copy">
          <h1>Helpdesk</h1>
          <p>Every request, tracked to done.</p>
        </div>
      </section>
      <section className="auth-panel">
        <form className="auth-card" onSubmit={submit}>
          <h2>Sign in to Helpdesk</h2>
          <p className="auth-subtitle">Enter your details to continue to your workspace.</p>
          {params.get("expired") && <div className="alert-info">Your session expired. Please sign in again.</div>}
          <ErrorMessage>{error}</ErrorMessage>
          <label className="field-label" htmlFor="email">Email address</label>
          <input className="in" id="email" type="email" autoComplete="email" placeholder="you@company.com" required value={email} onChange={(event) => setEmail(event.target.value)} />
          <label className="field-label" htmlFor="password">Password</label>
          <div className="password-field">
            <input className="in" id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" required value={password} onChange={(event) => setPassword(event.target.value)} />
            <button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button>
          </div>
          <button className="btn auth-submit" disabled={busy}>{busy ? <><span className="spinner spinner-button" />Signing in...</> : "Sign in"}</button>
          <div className="account-contact">
            <strong>Need an account? Contact your administrator.</strong>
            <span>Accounts and staff credentials are managed by your administrator.</span>
          </div>
        </form>
      </section>
    </main>
  );
}
