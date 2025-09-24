
# Unified Copilot Instructions for AI Coding Agents

## Project Overview
- **Frontend:** React (TypeScript) SPA, bootstrapped with Create React App, styled with Tailwind CSS and custom SCSS. Modular feature folders under `src/components/`, `src/pages/`, API/service logic in `src/services/` and `src/api/`.
- **Backend:** Spring Boot (Java 17), RESTful API, modular service/repository/resource layers. Database migrations managed via Flyway (`backend/FLYWAY.md`).
- **Docker:** Both frontend and backend have Dockerfiles for containerization. See `Dockerfile.frontend`, `backend/Dockerfile`, and `nginx.conf`.

## Architecture & Data Flow
- **Frontend:**
	- Feature-based folders (e.g., Cliente, Projeto, User) with tables, modals, filter panels, status badges.
	- State via React Contexts (`AuthContext.tsx`, `NotificationContext.tsx`).
	- API calls abstracted in `src/services/` and `src/api/`, using Axios. Never call APIs directly from components.
	- Permissions enforced via helpers (`src/utils/hasPermission.ts`) and enums (`src/permissions/rolePermissions.ts`).
- **Backend:**
	- REST controllers in `backend/src/main/java/com/fl/dashboard/resources/` (e.g., `ProjetoResource.java`).
	- Service layer handles business logic (e.g., `ProjetoService.java`, `UserService.java`).
	- Entities and DTOs in `entities/` and `dto/` folders. Permissions as enums (`enums/Permission.java`).
	- Notification and Slack integration via dedicated services (`NotificationService.java`, `SlackService.java`).
	- Database migrations in `backend/src/main/resources/db/migration/` (see `FLYWAY.md`).

## Developer Workflows
- **Frontend:**
	- Start dev server: `npm start` (http://localhost:3000)
	- Build: `npm run build`
	- Test: `npm test` (Jest)
	- Lint: ESLint (auto-included)
- **Backend:**
	- Build: `mvn clean package` (requires Java 17)
	- Run: `mvn spring-boot:run` or via Docker
	- Test: `mvn test` (JUnit)
	- Database migrations: `mvn flyway:migrate` or `scripts/apply-migrations.bat`
	- Backup DB: `scripts/backup-db.bat` (Windows) or `scripts/backup-db.sh` (Linux/Mac)

## Integration Points
- **Authentication:** JWT-based, managed in backend and surfaced to frontend via custom logic (`authApi.ts`, `axiosInterceptors.ts`).
- **Notifications:** Real-time via WebSocket and Slack, centralized in backend (`NotificationService.java`, `SlackService.java`), surfaced in frontend via context and API modules.
- **Permissions:** Role-based, defined in backend (`Permission.java`) and mirrored in frontend (`rolePermissions.ts`). Checked at both API and UI levels.
- **Database:** Flyway migrations, SQL files in `backend/src/main/resources/db/migration/`. Naming: `V{version}__{description}.sql`.
- **CI/CD:** GitHub Actions for migration validation and reporting (see `FLYWAY.md`).

## Project-Specific Patterns & Conventions
- **Frontend:**
	- All API calls go through service modules; error handling is standardized (see `apiConfig.ts`).
	- Table/filter/pagination conventions in `src/components/Projeto/README.md`.
	- Use SCSS variables from `src/assets/styles/_variables.scss` for custom styles.
- **Backend:**
	- Service layer always mediates between controllers and repositories.
	- Permissions and access checks are enforced in service/resource classes (see `shouldDenyProjectAccess` in `ProjetoService.java`).
	- Notification logic is centralized and tested (`NotificationServiceTest.java`).
	- Slack integration is configurable via environment variables and properties.

## Examples
- **Add a new entity:**
	- Frontend: Create folders in `src/components/` and `src/pages/`, implement table/modal/filter, connect to API/service layer.
	- Backend: Add entity/DTO/service/resource, update migrations, expose REST endpoints.
- **Database migration:**
	- Add SQL file to `backend/src/main/resources/db/migration/` (see `FLYWAY.md`).
	- Run migration and commit changes.

## References
- [frontweb/README.md](../README.md) for frontend setup
- [backend/FLYWAY.md] for database migrations
- [src/components/Projeto/README.md] for UI conventions
- [backend/Dockerfile] and [Dockerfile.frontend] for containerization

---
**Feedback:** If any section is unclear or missing, please specify what needs improvement or additional detail.