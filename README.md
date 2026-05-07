# FL Dashboard

> **Internal Admin Dashboard** for project, task, client, and team management — built with a React + TypeScript frontend and a Spring Boot backend.

🌐 **Live:** [ferreiralapa-dashboard.pt](https://ferreiralapa-dashboard.pt)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Running with Docker Compose](#running-with-docker-compose)
  - [Running Locally (Manual Setup)](#running-locally-manual-setup)
- [Environment Variables](#environment-variables)
- [Database Migrations](#database-migrations)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)

---

## Overview

FL Dashboard is a full-stack internal tool designed to streamline the management of projects, tasks, clients, proposals, and team members. It features a Kanban board, project metrics/charts, real-time notifications via WebSockets, and Slack integration for key workflow events.

---

## Features

- **Projects** — Create, list, and manage projects with status tracking
- **Tasks (Tarefas)** — Full task lifecycle management with assignment and status updates
- **Kanban Board** — Drag-and-drop task board (react-beautiful-dnd)
- **Project Metrics** — Visual analytics with charts (Recharts)
- **Calendar** — Task and project calendar view (React Big Calendar)
- **Users & Clients** — Manage internal users, external collaborators, and clients
- **Proposals (Propostas)** — Manage project proposals
- **Real-time Notifications** — WebSocket-based in-app notifications (STOMP/SockJS)
- **Slack Integration** — Automated notifications for key events, such as:
  - Task assigned 
  - Task status changed 
  - Task completed 
  - Project completed 
- **Global Search**
- **Authentication & Authorization** — OAuth2 Authorization Server + Resource Server (role-based permissions)

---

## Tech Stack

### Frontend (`/frontweb`)
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| React Router v6 | Client-side routing |
| Bootstrap 5 + React-Bootstrap | UI components & layout |
| Tailwind CSS | Utility-first styling |
| Axios | HTTP client |
| Recharts | Charts and metrics |
| React Big Calendar | Calendar views |
| React Beautiful DnD | Drag-and-drop Kanban |
| STOMP.js + SockJS | WebSocket real-time comms |
| React Select | Enhanced select inputs |
| FontAwesome + Bootstrap Icons | Icons |
| date-fns | Date utilities |

### Backend (`/backend`)
| Technology | Purpose |
|---|---|
| Spring Boot 3.2.5 (Java 17) | Application framework |
| Spring Security + OAuth2 | Authentication & Authorization Server |
| Spring Data JPA + Hibernate | ORM / data access |
| Flyway | Database migrations |
| MySQL 8 | Primary database |
| Spring WebSocket | Real-time notifications |
| Spring Boot Actuator | Health checks & monitoring |
| SpringDoc OpenAPI (Swagger) | API documentation |
| Lombok | Boilerplate reduction |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Local containerised development |
| Nginx | Frontend static file serving |
| DigitalOcean App Platform | Cloud deployment (`app.yaml`) |

---

## Project Structure

```
fl-dashboard/
├── backend/                  # Spring Boot application
│   ├── src/main/java/com/fl/dashboard/
│   │   ├── config/           # Security, WebSocket, CORS, OpenAPI config
│   │   ├── converters/       # Data converters
│   │   ├── customgrant/      # Custom OAuth2 grant types
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── entities/         # JPA entities
│   │   ├── enums/            # Application enums
│   │   ├── projections/      # JPA projections
│   │   ├── repositories/     # Spring Data repositories
│   │   ├── resources/        # REST controllers
│   │   ├── schedulers/       # Scheduled tasks
│   │   ├── services/         # Business logic
│   │   └── utils/            # Utility classes
│   ├── Dockerfile
│   └── pom.xml
│
├── frontweb/                 # React + TypeScript application
│   ├── src/
│   │   ├── api/              # Axios API clients
│   │   ├── auth/             # Auth helpers
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/
│   │   │   ├── Homepage/
│   │   │   ├── Projetos/     # Projects
│   │   │   ├── Tarefa/       # Tasks
│   │   │   ├── KanbanBoard/
│   │   │   ├── Clientes/     # Clients
│   │   │   ├── Externos/     # External collaborators
│   │   │   ├── Propostas/    # Proposals
│   │   │   ├── ProjetoMetrics/
│   │   │   ├── Users/
│   │   │   ├── Notifications/
│   │   │   └── Search/
│   │   ├── permissions/      # Role-based access control
│   │   ├── routes/           # Route definitions
│   │   ├── services/         # Service layer
│   │   ├── types/            # TypeScript types/interfaces
│   │   ├── utils/            # Utility functions
│   │   ├── AuthContext.tsx   # Authentication context
│   │   └── NotificationContext.tsx
│   ├── Dockerfile.frontend
│   └── package.json
│
├── docker-compose.yml        # Multi-service local setup
├── app.yaml                  # DigitalOcean App Platform config
└── import.sql                # Initial database seed data
```

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- **Or**, for manual setup:
  - Java 17+
  - Maven 3.8+
  - Node.js 18+ & npm
  - MySQL 8

### Running with Docker Compose

This is the easiest way to run the full stack locally.

```bash
# Clone the repository
git clone https://github.com/carlosLapa/fl-dashboard.git
cd fl-dashboard

# Copy and configure backend environment variables
cp backend/.env.template backend/.env
# Edit backend/.env with your values

# Build and start all services (frontend, backend, database)
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| MySQL | localhost:3307 |

### Running Locally (Manual Setup)

**Backend:**
```bash
cd backend

# Copy and configure environment variables
cp .env.template .env

# Run the Spring Boot application
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd frontweb

# Install dependencies
npm install

# Start the development server
npm start
```

---

## Environment Variables

Copy `backend/.env.template` to `backend/.env` and fill in the required values:

| Variable | Description |
|---|---|
| `SPRING_DATASOURCE_URL` | JDBC URL for MySQL |
| `SPRING_DATASOURCE_USERNAME` | Database username |
| `SPRING_DATASOURCE_PASSWORD` | Database password |
| `CORS_ORIGINS` | Allowed CORS origins |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook URL |
| `SLACK_ENABLED` | Enable/disable Slack notifications (`true`/`false`) |
| `SLACK_DEFAULT_CHANNEL` | Default Slack channel (e.g. `#notifications`) |
| `SLACK_NOTIFICATION_TYPES` | Comma-separated notification types to send |

---

## Database Migrations

This project uses **Flyway** for database schema migrations. Migration scripts are located in `backend/src/main/resources/db/migration`.

Migrations run automatically on application startup. For manual Flyway operations, refer to [`backend/FLYWAY.md`](backend/FLYWAY.md).

---

## API Documentation

When the backend is running, the interactive Swagger UI is available at:

```
http://localhost:8080/swagger-ui/index.html
```

---

## Deployment

The application is deployed on **DigitalOcean App Platform** using the [`app.yaml`](app.yaml) configuration file.

The backend health check endpoint used by the platform is:
```
GET /actuator/health
```
