# Helpdesk Frontend Instructions

## Scope

- This repository is the React and Vite frontend for the existing Spring Boot helpdesk backend at `http://localhost:8080`.
- Do not modify the backend or invent API routes, request fields, response fields, or role permissions.
- Use the shared Axios client in `src/api.js` for API calls. It adds the bearer token and handles expired sessions.
- Keep the existing route paths and role guards. There is no self-service account-creation screen or route; administrators create accounts from Users.
- Do not add self-registration links, UI, or API flows.
- Do not store passwords or log access tokens.

## Backend contract

- Authentication uses `POST /auth/login` and `GET /auth/me`. Logout is local: remove `token` and `user` from local storage.
- Ticket routes: `GET /ticket`, `POST /ticket`, `GET /ticket/{id}`, `PUT /ticket/{id}`, `DELETE /ticket/{id}`, `PUT /ticket/{id}/assign`, `PUT /ticket/{id}/status?status=X`, and `PUT /ticket/{id}/reopen`.
- Comment routes: `POST /ticket/{id}/comments`; ticket details include the comment list. Employee responses exclude internal comments.
- Ticket history: `GET /ticket/{id}/history`; staff roles only.
- Admin routes: `GET /dashboard/stats`, `GET /users`, and `POST /users`.
- Roles are `EMPLOYEE`, `TECH_SUPPORT`, and `ADMIN`. Backend authorization is authoritative; client-side guards only improve navigation.
- Employees see their own tickets. Tech support sees unassigned tickets and tickets assigned to them. Admins see every ticket.
- Ticket statuses: `OPEN`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `REOPENED`. Priorities: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- A status transition must use the documented workflow. Tech support can assign an unassigned ticket to themselves; admins assign an active tech-support user by email.
- Display backend validation `fieldErrors` next to their fields and other API errors with the shared error helper.

## Design system

- Use plain CSS and React; do not add UI libraries or Tailwind. Inline SVG icons are acceptable; no emoji.
- Use IBM Plex Sans and the CSS variables in `src/index.css`.
- Core colors: background `#F5F7FA`, surface `#FFFFFF`, border `#E3E8EF`, text `#1A2433`, muted text `#5B6B80`, primary teal `#0F766E` with hover `#0B5F58`, and sidebar `#0E2A36`.
- Semantic colors: success `#067647`, warning `#B54708`, danger `#B42318`, and info `#175CD3`, with readable tinted badge backgrounds.
- Use a 4/8px spacing rhythm, 8px control radius, 12px card radius, subtle shadows, and type sizes from 12px to 30px.
- Keep interactive controls at least 44px high and provide a visible 2px teal focus ring. Maintain WCAG AA text contrast and responsive layouts.
- The application shell has a 240px dark sidebar, role-aware navigation, and a header with the page title and signed-in user details. At widths below 900px, navigation becomes a slide-out menu.
- Reuse components from `src/components` for buttons, fields, badges, cards, loading/empty states, toast messages, and confirmations.

## Verification

- Run `npm run build` after each requested UI phase; run `npm run lint` when changes may affect JSX or imports.
- The backend allows the frontend origin `http://localhost:5173`; use `localhost` rather than `127.0.0.1` for local integration.
