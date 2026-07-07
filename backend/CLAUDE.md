# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build
./mvnw clean install

# Run (uses dev profile by default)
./mvnw spring-boot:run

# Run tests
./mvnw test

# Run a single test class
./mvnw test -Dtest=NotificationServiceTest

# Run a single test method
./mvnw test -Dtest=NotificationServiceTest#methodName

# Check Flyway migration status
mvn flyway:info -Dflyway.url=jdbc:mysql://localhost:3306/fldashboard -Dflyway.user=root -Dflyway.password=123456

# Apply Flyway migrations manually
mvn flyway:migrate -Dflyway.url=jdbc:mysql://localhost:3306/fldashboard -Dflyway.user=root -Dflyway.password=123456
```

## Architecture

Standard Spring Boot layered architecture under `com.fl.dashboard`:

- `resources/` — REST controllers (`@RestController`), named `*Resource.java`
- `services/` — Business logic (`@Service`)
- `repositories/` — Spring Data JPA repositories
- `entities/` — JPA entities mapped to MySQL tables
- `dto/` — Data Transfer Objects (Input, Min, With* projection variants)
- `config/` — Spring Security, WebSocket, CORS configuration
- `enums/` — Domain enums (statuses, types, permissions, roles)
- `customgrant/` — Custom OAuth2 password grant implementation
- `projections/` — JPA interface projections for queries

## Security Model

The app acts as both an **OAuth2 Authorization Server** and a **Resource Server**:

- `AuthorizationServerConfig` — Issues JWT tokens via a custom `password` grant type. RSA keys are generated in-memory on startup (not persistent across restarts). JWT claims include `authorities`, `username`, and `email`.
- `ResourceServerConfig` — Validates JWTs; uses `@EnableMethodSecurity` for fine-grained access control. The `authorities` claim is read without a prefix.
- `PermissionMapper` — Maps `RoleType` (ADMIN, MANAGER, EMPLOYEE) to the `Permission` enum values.
- Authentication uses email as the username (`User.getUsername()` returns `email`).

Key env vars: `CLIENT_ID`, `CLIENT_SECRET`, `JWT_DURATION` (seconds), `ISSUER_URI`, `CORS_ORIGINS`.

## Profiles

| Profile | Database | Notes |
|---------|----------|-------|
| `dev` (default) | MySQL `localhost:3306/fldashboard`, user `root` / `123456` | `ddl-auto=update`, SQL logging on |
| `test` | H2 in-memory | `testdb`, H2 console at `/h2-console` |
| `prod` | MySQL via env vars | `ddl-auto=validate`, verbose logging off |

## Database Migrations

Flyway migrations run automatically on startup from `src/main/resources/db/migration/`. Name new files following the pattern `V{n}__{Description}.sql` where `n` increments from the highest existing version.

In prod, `ddl-auto=validate` means Hibernate only validates against the schema — all schema changes must go through Flyway.

## WebSocket / Notifications

- STOMP over SockJS at endpoint `/ws`
- Clients subscribe to `/topic/notifications/{userId}` for user-specific notifications
- JWT validation happens in `WebSocketConfig` on the `CONNECT` command via a `ChannelInterceptor`
- `NotificationService` sends via `SimpMessagingTemplate` **after transaction commit** using `TransactionSynchronizationManager.registerSynchronization`

## Slack Integration

`SlackService` sends webhook notifications for configurable `NotificationType` values. Key env vars:
- `SLACK_WEBHOOK` — incoming webhook URL
- `SLACK_ENABLED` — boolean toggle
- `SLACK_NOTIFICATION_TYPES` — comma-separated list (e.g. `TAREFA_ATRIBUIDA,TAREFA_CONCLUIDA`)

Duplicate suppression is in-memory with a 10-second window for simple messages and 30-second window for grouped notifications.

## DTO Conventions

Each domain entity typically has several DTO variants:
- `*DTO` — full representation
- `*MinDTO` — minimal (id + key display fields)
- `*InsertDTO` / `*UpdateDTO` — write operations
- `*With{Relation}DTO` — includes related entities (e.g. `ProjetoWithUsersDTO`)