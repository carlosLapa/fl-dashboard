# Flyway Database Migration Guide

This project uses Flyway for database schema migrations. This document explains how to work with database migrations.

## Migration Files Location

All migration files are stored in:
```
backend/src/main/resources/db/migration
```

## Naming Convention

Migration files follow this naming convention:
```
V{version}__{description}.sql
```

Example:
```
V1__create_users_table.sql
V2__add_email_to_users.sql
```

## Creating a New Migration

1. Create a new SQL file in the migrations directory
2. Name it following the convention (increment the version number)
3. Write your SQL statements
4. Test the migration locally before committing

## Running Migrations

### Automatic Migrations
Migrations run automatically when the application starts.

### Manual Migrations
To manually apply migrations:

1. Use the provided script:
   ```
   ./scripts/apply-migrations.bat   # Windows
   ./scripts/apply-migrations.sh    # Linux/Mac
   ```

2. Or use Maven directly:
   ```
   cd backend
   mvn flyway:migrate -Dflyway.url=jdbc:mysql://localhost:3306/fldashboard -Dflyway.user=root -Dflyway.password=password
   ```

## Checking Migration Status

To check the status of migrations:

```
cd backend
mvn flyway:info -Dflyway.url=jdbc:mysql://localhost:3306/fldashboard -Dflyway.user=root -Dflyway.password=password
```

## Database Backup

Always backup the database before applying migrations to production:

```
./scripts/backup-db.bat   # Windows
./scripts/backup-db.sh    # Linux/Mac
```

## CI/CD Integration

This project includes GitHub Actions workflows that:
1. Validate migration syntax
2. Check for pending migrations
3. Generate migration reports on pull requests

## Best Practices

1. **One Change Per Migration**: Each migration should make one logical change
2. **Idempotent When Possible**: Prefer `CREATE TABLE IF NOT EXISTS` over `CREATE TABLE`
3. **No Application Logic**: Migrations should only contain DDL/DML statements
4. **Test Thoroughly**: Test migrations on a copy of production data before deploying
5. **Version Control**: Always commit migration files with related application code changes
```

### 2. Update Your Main README.md

Add a section about database migrations to your main README.md:

```markdown
## Database Migrations

This project uses Flyway for database schema migrations. For detailed information about working with migrations, see [FLYWAY.md](backend/FLYWAY.md).

### Quick Migration Commands

- Check migration status: `cd backend && mvn flyway:info`
- Apply migrations manually: `scripts/apply-migrations.bat` (Windows) or `scripts/apply-migrations.sh` (Linux/Mac)
- Backup database: `scripts/backup-db.bat` (Windows) or `scripts/backup-db.sh` (Linux/Mac)
```

### 3. Create a Sample Migration

If you haven't already, create a sample migration file to test your setup:

```sql:backend/src/main/resources/db/migration/V1__initial_schema.sql
-- Initial database schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add any other initial tables here
```

### 4. Test Your Scripts

Test your backup script first:

```bash
scripts\backup-db.bat
```

If that works, you can test the migration script (be careful, as this will apply migrations to your production database):

```bash
scripts\apply-migrations.bat
```

### 5. Commit Your Changes

Once everything is working, commit your changes:

```bash
git add scripts/
git add backend/FLYWAY.md
git add -u  # Add all modified files
git commit -m "Add Flyway database migration scripts and documentation"
git push
