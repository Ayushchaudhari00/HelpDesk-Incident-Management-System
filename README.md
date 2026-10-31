# HelpDesk Incident Management System

A full-stack helpdesk application for creating, tracking, and managing support tickets. It includes a React frontend, Spring Boot REST API, MongoDB database, and Docker Compose setup.

## Features

- User login and registration
- Create and view support tickets
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

### Start the application

In PowerShell, go to the project folder:

```powershell
cd "C:\Users\noddy\Downloads\HelpDesk"
```

Create your local environment file and edit it:

```powershell
Copy-Item .env.example .env
notepad .env
```

Set your own values for `ADMIN_PASSWORD` and `JWT_SECRET` in `.env`, then save the file. Keep `.env` private; it is excluded from Git.

Build and start the containers:

```powershell
docker compose up --build
```

The first build may take a few minutes while Docker downloads images and builds the applications.

Open the frontend at [http://localhost:3000](http://localhost:3000). The backend API is available at [http://localhost:8080](http://localhost:8080).

The initial administrator email is the value of `ADMIN_EMAIL` in `.env` (default: `admin@helpdesk.local`). The initial password is the value of `ADMIN_PASSWORD`. The backend creates this administrator on first startup if the account does not already exist.

### Stop the application

Press **Ctrl+C** in the terminal running Compose, then run:

```powershell
docker compose down
```

MongoDB data is kept in a Docker volume when the containers are stopped.

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

- `ADMIN_EMAIL`: email for the initial administrator account
- `ADMIN_PASSWORD`: password for the initial administrator account
- `JWT_SECRET`: secret used to sign authentication tokens; use a unique value of at least 32 characters
- `CORS_ALLOWED_ORIGINS`: frontend origin allowed to call the API
- `VITE_API_URL`: backend URL used by the frontend build

Do not commit `.env` or put production secrets in source control.

## Run locally without Docker

Start MongoDB separately, then run the backend and frontend in separate terminals.

Backend:

```powershell
cd "Helpdesk Incident -backend\Helpdesk-Incident-Management-System"
.\mvnw.cmd spring-boot:run
```

Frontend:

```powershell
cd "Helpdesk Incident -FrontEnd\HelpDesk-FrontEnd"
npm install
npm run dev
```

The Vite development server runs at [http://localhost:5173](http://localhost:5173). The backend must be running and configured to allow that origin.
