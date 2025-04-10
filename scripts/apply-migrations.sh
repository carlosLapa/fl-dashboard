#!/bin/bash
# Script to manually apply Flyway migrations to DigitalOcean database

# Determine script directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." &> /dev/null && pwd )"

# Load environment variables from backend directory
if [ -f "$PROJECT_ROOT/backend/.env" ]; then
  source "$PROJECT_ROOT/backend/.env"
else
  echo "Error: backend/.env file not found"
  exit 1
fi

# Confirm before proceeding
echo "This script will apply database migrations to PRODUCTION."
echo "Database: ${DB_NAME} on ${DB_HOST}"
echo "Are you sure you want to continue? (yes/no)"
read confirmation

if [ "$confirmation" != "yes" ]; then
  echo "Operation cancelled."
  exit 0
fi

# Create backup first
"$SCRIPT_DIR/backup-db.sh"

if [ $? -ne 0 ]; then
  echo "Backup failed. Aborting migration."
  exit 1
fi

# Show migration info
echo "Migration information:"
cd "$PROJECT_ROOT/backend"
mvn flyway:info -Dflyway.url=jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}?sslMode=REQUIRED -Dflyway.user=${DB_USER} -Dflyway.password=${DB_PASSWORD}

# Final confirmation
echo "Ready to apply migrations. Type 'APPLY' to continue:"
read final_confirmation

if [ "$final_confirmation" != "APPLY" ]; then
  echo "Migration cancelled."
  exit 0
fi

# Apply migrations
echo "Applying migrations..."
mvn flyway:migrate -Dflyway.url="jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}?sslMode=REQUIRED" -Dflyway.user="${DB_USER}" -Dflyway.password="${DB_PASSWORD}"

# Check result
if [ $? -eq 0 ]; then
  echo "Migrations applied successfully."
else
  echo "Migration failed. Please check the logs."
fi