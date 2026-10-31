# HelpDesk Incident Management System

A full-stack application for creating, tracking, and managing helpdesk tickets. It includes a React frontend, a Spring Boot REST API, MongoDB, and Docker Compose configuration.

## Features

- User login and registration
- Create and manage support tickets
- Assign tickets and update their status
- Add comments and view ticket history
- Admin dashboard and user management
- JWT-based authentication

## Technology

- **Frontend:** React, Vite, Axios
- **Backend:** Java 25, Spring Boot, Spring Security
- **Database:** MongoDB
- **Containers:** Docker and Docker Compose

## Run with Docker

### Requirements

Install and start [Docker Desktop](https://www.docker.com/products/docker-desktop/).

### Configure environment variables

Copy `.env.example` to `.env` in the project root. Open `.env` and replace the example values for `ADMIN_PASSWORD` and `JWT_SECRET` with your own values. Use a unique JWT secret of at least 32 characters.

Keep `.env` private. It is excluded from Git.

### Start the application

From the project root, run:

```bash
docker compose up --build
```

The first build may take a few minutes while Docker downloads images and builds the applications.

Open the frontend at [http://localhost:3000](http://localhost:3000). The backend API is available at [http://localhost:8080](http://localhost:8080).

The initial administrator email is set by `ADMIN_EMAIL` in `.env` (default: `admin@helpdesk.local`). The initial password is the value of `ADMIN_PASSWORD`. On startup, the backend creates this admin account if it does not already exist.

### Stop the application

Press **Ctrl+C** in the terminal running Docker Compose, then run:

```bash
docker compose down
```

MongoDB data is stored in a Docker volume and remains available when the containers are stopped.

## Project structure

```text
HelpDesk/
├── docker-compose.yml
├── .env.example
├── Helpdesk Incident -backend/
│   └── Helpdesk-Incident-Management-System/
│       ├── Dockerfile
│       └── src/
└── Helpdesk Incident -FrontEnd/
    └── HelpDesk-FrontEnd/
        ├── Dockerfile
        ├── nginx.conf
        └── src/
```

## Configuration

The root `.env.example` file lists the environment variables used by Docker Compose:

- `ADMIN_EMAIL`: email address for the initial administrator account
- `ADMIN_PASSWORD`: password for the initial administrator account
- `JWT_SECRET`: secret used to sign authentication tokens
- `CORS_ALLOWED_ORIGINS`: frontend origin allowed to call the API
- `VITE_API_URL`: backend URL used during the frontend build

Do not commit `.env` or store production secrets in source control.

## Run locally without Docker

Start MongoDB separately, then run the backend and frontend in separate terminals.

Backend:

```bash
cd "Helpdesk Incident -backend/Helpdesk-Incident-Management-System"
./mvnw spring-boot:run
```

Frontend:

```bash
cd "Helpdesk Incident -FrontEnd/HelpDesk-FrontEnd"
npm install
npm run dev
```

The Vite development server runs at [http://localhost:5173](http://localhost:5173). The backend must be running and configured to allow that origin.
