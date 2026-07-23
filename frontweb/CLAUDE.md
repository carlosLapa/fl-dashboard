# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FL Dashboard is a React 18 + TypeScript SPA (Create React App) for project/task management. The backend is a Spring Boot (Java 17) REST API. This directory is the **frontend** (`frontweb/`).

## Commands

```bash
npm start          # Dev server at http://localhost:3000 (connects to localhost:8080)
npm run build      # Production build → build/
npm test           # Jest tests (watch mode)
```

Backend (from `../backend/`):
```bash
mvn spring-boot:run       # Run backend
mvn clean package         # Build backend JAR
mvn test                  # Run JUnit tests
```

### Updating dependencies

`Dockerfile.frontend` builds with `node:20-alpine`, which bundles a specific npm version. If your local npm version differs, `npm install` can resolve optional peer dependencies differently and produce a `package-lock.json` that passes locally but fails `npm ci` in the Docker build (CI) with "Missing: X from lock file" errors.

After changing any dependency (`npm install <pkg>@<version>`), regenerate the lockfile against the same environment the Docker build uses:

```bash
npm run lockfile:sync   # runs `npm install --package-lock-only` inside node:20-alpine
```

The script copies only `package.json`/`package-lock.json` into an isolated temp directory before running Docker, so a local `node_modules` (built with a different node/npm version) never leaks into the resolution.

Then verify `git diff package-lock.json` only contains the expected changes before committing.

## Architecture

### Folder Structure

- `src/api/` — Axios API modules per domain (one file per entity). Never call these directly from components.
- `src/services/` — Business logic layer. Components always import from services, not `api/` directly.
- `src/components/` — Feature-based component folders (Projeto, Tarefa, Proposta, Cliente, Externo, User, etc.)
- `src/pages/` — Route-level page components, one folder per route.
- `src/hooks/` — Custom React hooks.
- `src/permissions/` — Permission enum and role-to-permission mappings.
- `src/types/` — All TypeScript type definitions (one file per domain).
- `src/auth/` — JWT token management, Axios interceptors, CSRF, encrypted storage.
- `src/assets/styles/` — SCSS files; use variables from `_variables.scss` for custom styles.

### State Management

Two global React Contexts (no Redux):
- **AuthContext** (`src/AuthContext.tsx`) — JWT auth, token refresh, inactivity timeout (10 min warn, 11 min auto-logout), cross-tab logout.
- **NotificationContext** (`src/NotificationContext.tsx`) — Real-time notifications via WebSocket, unread count, pagination.

Access via `useAuth()` and `useNotification()` hooks.

### Authentication & API

- OAuth2 password grant → JWT stored in encrypted localStorage (XOR + Base64 in `src/auth/secureStorage.ts`).
- Axios instance configured in `src/api/apiConfig.ts` with base URL from `REACT_APP_API_URL` (default: `http://localhost:8080`).
- Token refresh interceptor in `src/auth/axiosInterceptors.ts` handles 401 responses transparently.
- Global error interceptor in `apiConfig.ts` gracefully degrades 403/404 on list endpoints (returns `{ content: [], totalPages: 0 }` instead of throwing).

### Permissions

Three roles: `ADMIN` (all permissions), `MANAGER`, `EMPLOYEE`.

Permission checking:
- `usePermissions()` hook — preferred approach: `hasPermission()`, `hasAnyPermission()`, `isAdmin()`, `isManager()`.
- `PermissionGate` component — wraps UI that should only render for certain permissions.
- `ProtectedRoute` / `PermissionProtectedRoute` — route-level guards.
- Permissions are **mirrored** in backend (`Permission.java`) — both layers enforce them.

Employees cannot move Kanban cards to REVIEW or DONE, and cannot access propostas or admin routes.

### Real-time (WebSocket)

`useWebSocket` hook (`src/hooks/useWebSocketMessage.tsx`) — STOMP over SockJS, connects to `/ws`. Subscribes to `/topic/notifications/{userId}` and `/topic/project-notifications/{userId}`. Auto-reconnects up to 3 times with a 5-second delay; queues messages when offline.

### Adding New Entities

**Frontend:**
1. Add TypeScript types in `src/types/`.
2. Add API module in `src/api/`.
3. Add service in `src/services/`.
4. Create component folder in `src/components/` (table, modal, filter panel pattern).
5. Create page in `src/pages/` and wire route in `src/routes/AppRoutes.tsx`.

**Backend:**
1. Add entity, DTO, repository, service, REST resource.
2. Add Flyway migration: `backend/src/main/resources/db/migration/V{version}__{description}.sql`.

### Styling

Bootstrap 5 + Tailwind CSS + custom SCSS. SCSS design tokens live in `src/assets/styles/_variables.scss` (primary blue: `#81a6f0`, body bg: `#F2F2F2`). Prefer SCSS variables over hardcoded colors.

### Key Libraries

| Purpose | Library |
|---------|---------|
| Routing | React Router v6 |
| HTTP | Axios |
| WebSocket | STOMP.js + SockJS |
| Kanban | React Beautiful DnD |
| Calendar | React Big Calendar |
| Charts | Recharts |
| Dropdowns | React Select |
| Date utils | date-fns |
| Toasts | React Toastify |
