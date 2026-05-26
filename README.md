# Task Manager

A full-stack task management app with a React frontend and .NET Core minimal API backend.
---

## Setup and running 

## Prerequisites

- [Node.js](https://nodejs.org/) 20+ and [pnpm](https://pnpm.io/)
- [.NET SDK 10](https://dotnet.microsoft.com/download)

---

### 1. Backend

```bash
cd backend/TaskManagerAPI
dotnet run
```

The API starts on `http://localhost:5000`. Swagger UI is at `http://localhost:5000/swagger`.

### 2. Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

The app is served at `http://localhost:5173`. Requests to `/api/*` are proxied to the backend automatically.

The default `VITE_API_URL` in [frontend/.env](frontend/.env) points to `http://localhost:5000`. Change it if your backend runs on a different port.

---

## Running tests

### Backend integration tests

```bash
cd backend
dotnet test
```

Tests use `WebApplicationFactory` to spin up the full ASP.NET pipeline in memory with a fresh isolated database per test class.

### Frontend unit tests

```bash
cd frontend
pnpm test
```

Runs Vitest once. Use `pnpm test:watch` for watch mode.

## Stack

### Frontend

| Tool | Purpose |
|---|---|
| React 19 + TypeScript | UI layer |
| Vite 8 | Dev server and bundler |
| Tailwind CSS v4 | Utility-first styling via the Vite plugin |
| Vitest + Testing Library | Unit and component tests |

**Structure**

```
frontend/src/
├── components/
│   ├── AddTask.tsx       # Controlled form for creating tasks
│   └── TaskItem.tsx      # Individual task row with inline edit, complete, delete
├── context/
│   └── TaskContext.tsx   # Global task state + all API mutations
├── lib/
│   └── api.ts            # Thin fetch wrapper (get/post/put/del)
└── App.tsx               # Root layout, loading/error states
```

`TaskContext` holds all server state. Mutations apply optimistically and roll back on error so the UI stays responsive without a dedicated state library.

### Backend

| Tool | Purpose |
|---|---|
| ASP.NET Core 10 (Minimal API) | HTTP layer |
| Entity Framework Core (in-memory) | Data access |
| Swagger / Swashbuckle | Auto-generated API docs |
| xUnit + WebApplicationFactory | Integration tests against a real in-process server |

**Structure**

```
backend/TaskManagerAPI/
├── Endpoints/
│   └── TasksEndpoints.cs   # All route handlers mapped via extension method
├── Models/
│   ├── AppDbContext.cs      # EF Core DbContext
│   └── Tasks.cs            # TaskItem entity (Id, Title, Description, IsComplete, CreatedAt)
└── Program.cs              # App composition root

backend/TaskManager.Tests/
└── TasksEndpointsTests.cs  # Integration tests for every endpoint
```

**API endpoints**

| Method | Path | Description |
|---|---|---|
| `GET` | `/tasks` | List all tasks (optional `?complete=true/false` filter) |
| `POST` | `/tasks` | Create a task |
| `PUT` | `/tasks/{id}` | Update title, description, and/or completion status |
| `DELETE` | `/tasks/{id}` | Delete a task |

Swagger UI is available at `http://localhost:5000/swagger` when running in development.

---

## Why this stack

**React + Vite** gives a fast iteration loop with no config overhead. Tailwind v4's Vite plugin means zero PostCSS configuration. React Context is used for state management, the Context API provides appropriate statemanagment with no extra boilerplate from Redux. If the application grows and we need additional features and data that requires multiple renders then switching to Redux or Zustand might be more beneficial.  

**ASP.NET Core Minimal APIs** map cleanly to REST conventions with very little boilerplate. In the future I would recommend adding SQLite to have data persistance, as well as authentication and user managment to account for different users and their tasks. 

**Vite proxy** (`/api → localhost:5000`) avoids CORS configuration during development. The frontend makes all requests to `/api/tasks` and Vite rewrites the path before forwarding.

---
