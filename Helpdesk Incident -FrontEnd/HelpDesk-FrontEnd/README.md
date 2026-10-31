# Helpdesk Frontend

React and Vite frontend for the helpdesk ticket API.

## Run locally

1. Install dependencies with `npm install`.
2. Start the development server with `npm run dev`.
3. Open `http://localhost:5173` (use `localhost`, not `127.0.0.1`, so the backend's CORS allowlist matches).

The API client uses `http://localhost:8080` by default. To use a different backend URL, create a `.env` file in this folder and set:

```env
VITE_API_URL=http://localhost:8080
```

Restart Vite after changing the API URL. The backend must be running and allow requests from the frontend origin.

## Checks

- `npm run lint`
- `npm run build`
