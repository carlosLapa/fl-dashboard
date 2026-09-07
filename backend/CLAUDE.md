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

## Verifying changes before pushing

`Dockerfile` (and CI) build with `maven:3.9-eclipse-temurin-17-alpine` (JDK 17). If your local `JAVA_HOME` points to a different major version (e.g. a newer JDK installed alongside 17), Lombok can silently fail to generate getters/setters under the mismatched JDK — no clear error, just "cannot find symbol" for methods that should exist. Don't trust a local `./mvnw compile` in that situation.

Verify by compiling inside the same image the build uses:

```bash
docker run --rm -v "<repo-path>/backend:/app" -w /app maven:3.9-eclipse-temurin-17-alpine mvn clean package -DskipTests
```

Use the **exact** command CI runs (`mvn clean package -DskipTests`), not just `mvn compile`: `-DskipTests` only skips *running* tests, it still runs `test-compile`, so a change to a class used by tests (e.g. a DTO field type) can compile fine with plain `mvn compile` and still break CI at `test-compile`.

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

### `authentication.name` resolves to the `email` claim, not `sub`

The custom password grant (`CustomPasswordAuthenticationProvider`) issues the JWT with the authenticated OAuth2 **client** as principal, not the resource owner — so the default `sub` claim is the client_id, identical for every user, not their email. `ResourceServerConfig#jwtAuthenticationConverter` explicitly overrides this with `setPrincipalClaimName("email")`, since `email` (added by `AuthorizationServerConfig#tokenCustomizer`) is the claim that actually identifies the user. **Don't remove that line** — without it, `authentication.getName()` / `authentication.name` in `@PreAuthorize` silently returns the client_id for everyone, which only breaks for roles that don't also pass via `hasAuthority(...)` (i.e. it looks fine when tested as ADMIN/MANAGER and is broken for EMPLOYEE self-access). This was a real bug, found by decoding a live JWT during the Banco de Horas work.

### Two `@PreAuthorize` conventions for per-`{userId}` endpoints

- **Self-service** (the user is expected to reach their own data): `hasAuthority('VIEW_REPORTS') or authentication.name == @userService.findById(#id).email`. Used by `UserExtraHoursResource`, `UserResource#findById`, `UserResource#getTarefasByUser`. For an id-less endpoint (e.g. `DELETE /{id}` where the resource, not the acting user, is in the path), fetch the owner and compare instead: see `UserExtraHoursService#isOwner` + `@userExtraHoursService.isOwner(#id, authentication.name)`.
- **Management-only** (a performance-evaluation tool where the subject should *not* see their own data): `hasAuthority('VIEW_REPORTS')` alone, deliberately with no self-access branch. Used by `ProjetoUserHistoryResource` and `TarefaUserDetalheResource` (both feed `UserProjetoHistoryPage` on the frontend). Don't copy the self-access idiom onto these without checking with the user first — it was mistakenly added once and had to be reverted.

Not having a UI link to an endpoint is not access control — every one of the bugs above was only found by hitting the backend route directly (browser URL bar or a copied JWT), bypassing the frontend entirely. Gate at the `@PreAuthorize` layer, not just by hiding the sidebar link.

### Actual blast radius of the `sub`/`email` bug (audited 2026-09-07)

The bug above only breaks code that reads `authentication.name` / `authentication.getName()` **directly**, because that's the one place there's no room for a workaround (it's SpEL inside an annotation, not a method body). Grepping `@PreAuthorize.*authentication\.name` across the whole codebase gives the complete list of what was actually affected:

- `UserExtraHoursResource` (all 5 self-access checks) — Banco de Horas, fixed.
- `UserResource#findById` (`GET /users/{id}`) — fixed (used by Banco de Horas' `getUserById`).
- `UserResource#getTarefasByUser` (`GET /users/{userId}/tarefas`) — same bug, fixed by the same config change, but turned out to be **dead code**: no frontend page calls it. `UsersTarefasPage` uses `GET /tarefas/user/{userId}/full` (`TarefaResource`) instead, which was never affected (see below). Zero visible impact either way.
- `ProjetoUserHistoryResource` / `TarefaUserDetalheResource` — same bug, but self-access was removed rather than fixed (see above).

Everywhere else that needs "who is the currently authenticated user" (`ProjetoResource`'s per-user project filtering/deadline-extension, `TarefaResource`/`SubtarefaResource`'s `extractUserEmail` helper, `ProjetoMetricsSnapshotResource`, and `UserService#update` / `#getCurrentAuthenticatedUser` / `#getCurrentUserWithRoles`) was **not** affected, because that code already reads the email off the JWT directly instead of trusting the principal name — e.g. `if (authentication.getPrincipal() instanceof Jwt jwt) { userEmail = jwt.getClaim("email"); } else { userEmail = authentication.getName(); }`, or casts to `JwtAuthenticationToken` and calls `getToken().getClaimAsString("email")`. This is a pre-existing, widespread ad-hoc workaround for the exact same root cause fixed above — evidence someone hit this bug long before and patched around it locally in each call site instead of fixing `ResourceServerConfig`. Worth knowing if you're auditing "who reads the current user" code: the `extractUserEmail`/`Jwt`-cast pattern is the safe one; a bare `authentication.getName()` outside that pattern is a red flag.

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

**Never nest the full `UserDTO` inside another DTO** (`ProjetoDTO.coordenador`, `TarefaWithUserAndProjetoDTO.users`, `ProjetoWithUsersDTO.users`, etc.) — it carries the password hash and the base64 `profileImage`, repeated once per reference with no dedup. A paginated list of 10-20 rows each embedding several full `UserDTO`s can balloon to multiple MB and leaks password hashes to the browser. Use `UserSummaryDTO` (id, name, email, funcao, cargo) for any nested/embedded user reference instead; keep the full `UserDTO` only for the direct `/users` endpoints where the profile image is actually needed.
