import { useState } from "react";
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { getUser } from "./api";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NewTicket from "./pages/NewTicket";
import TicketDetail from "./pages/TicketDetail";
import Tickets from "./pages/Tickets";
import Users from "./pages/Users";

function NavIcon({ kind }) {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    tickets: <><path d="M6 4h12a2 2 0 0 1 2 2v14l-2-1-2 1-2-1-2 1-2-1-2 1-2-1-2 1V6a2 2 0 0 1 2-2Z" /><path d="M8 9h8m-8 4h8m-8 4h5" /></>,
    new: <><path d="M12 5v14m-7-7h14" /></>,
    users: <><circle cx="9" cy="8" r="3.5" /><path d="M3 20v-1a6 6 0 0 1 12 0v1m2-11a3.5 3.5 0 0 1 0 6.8M18 17a4 4 0 0 1 3 3" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[kind]}</svg>;
}

function AppShell({ children }) {
  const user = getUser();
  const admin = user?.role === "ADMIN";
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const pageTitle = location.pathname.startsWith("/dashboard")
    ? "Dashboard"
    : location.pathname.startsWith("/users")
      ? "Users"
      : location.pathname === "/tickets/new"
        ? "New ticket"
        : location.pathname.startsWith("/tickets/")
          ? "Ticket details"
          : "Tickets";

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="app-shell">
      {menuOpen && <button className="sidebar-scrim" aria-label="Close navigation menu" onClick={closeMenu} />}
      <aside className={`sidebar${menuOpen ? " sidebar-open" : ""}`} id="primary-sidebar" aria-label="Primary navigation">
        <div className="sidebar-top">
          <Link className="brand" to="/tickets" aria-label="Helpdesk home" onClick={closeMenu}>
            <span className="brand-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13.5v-2a8 8 0 0 1 16 0v2M4 13.5H3v3a2 2 0 0 0 2 2h1v-5H4Zm16 0h1v3a2 2 0 0 1-2 2h-1v-5h2ZM9 19h6" /></svg></span>
            <span>Helpdesk</span>
          </Link>
          <button className="icon-button sidebar-close" onClick={closeMenu} aria-label="Close navigation menu"><NavIcon kind="close" /></button>
        </div>
        <div className="nav-caption">WORKSPACE</div>
        <nav className="side-nav">
          {admin && <NavLink to="/dashboard" className={({ isActive }) => `side-link${isActive ? " active" : ""}`} onClick={closeMenu}><span className="nav-icon"><NavIcon kind="dashboard" /></span>Dashboard</NavLink>}
          <NavLink end to="/tickets" className={({ isActive }) => `side-link${isActive ? " active" : ""}`} onClick={closeMenu}><span className="nav-icon"><NavIcon kind="tickets" /></span>Tickets</NavLink>
          <NavLink to="/tickets/new" className={({ isActive }) => `side-link${isActive ? " active" : ""}`} onClick={closeMenu}><span className="nav-icon"><NavIcon kind="new" /></span>New ticket</NavLink>
          {admin && <NavLink to="/users" className={({ isActive }) => `side-link${isActive ? " active" : ""}`} onClick={closeMenu}><span className="nav-icon"><NavIcon kind="users" /></span>Users</NavLink>}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-help"><div className="help-orb">?</div><strong>Need a hand?</strong><span>Keep every request moving.</span></div>
          <div className="profile">
            <div className="avatar" aria-hidden="true">{(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}</div>
            <div className="profile-text"><strong>{user?.name || user?.email}</strong><span>{user?.email}</span></div>
          </div>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Open navigation menu" aria-controls="primary-sidebar" aria-expanded={menuOpen}><NavIcon kind="menu" /></button>
            <span className="topbar-title">{pageTitle}</span>
          </div>
          <div className="topbar-user"><span className="avatar topbar-avatar" aria-hidden="true">{(user?.name || user?.email || "U").slice(0, 1).toUpperCase()}</span><span className="topbar-email">{user?.email}</span><span className={`role-badge role-${user?.role?.toLowerCase()}`}>{user?.role?.replace("_", " ")}</span><button className="btn ghost header-logout" onClick={logout}>Log out</button></div>
        </header>
        <main className="page-content">{children}</main>
        <footer className="app-footer">Helpdesk <span>·</span> Built to keep work moving</footer>
      </div>
    </div>
  );
}

function Protected({ children, adminOnly = false }) {
  if (!localStorage.getItem("token") || !getUser()) return <Navigate to="/login" replace />;
  if (adminOnly && getUser()?.role !== "ADMIN") return <Navigate to="/tickets" replace />;
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/tickets" element={<Protected><Tickets /></Protected>} />
        <Route path="/tickets/new" element={<Protected><NewTicket /></Protected>} />
        <Route path="/tickets/:id" element={<Protected><TicketDetail /></Protected>} />
        <Route path="/dashboard" element={<Protected adminOnly><Dashboard /></Protected>} />
        <Route path="/users" element={<Protected adminOnly><Users /></Protected>} />
        <Route path="/" element={<Navigate to="/tickets" replace />} />
        <Route path="*" element={<Navigate to="/tickets" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
