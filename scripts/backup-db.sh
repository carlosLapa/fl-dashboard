#!/bin/bash
# Script to backup the DigitalOcean database before migrations

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

# Format date for backup filename
BACKUP_DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$PROJECT_ROOT/backups/fldashboard_backup_${BACKUP_DATE}.sql"

# Create backups directory if it doesn't exist
mkdir -p "$PROJECT_ROOT/backups"

# Create backup
echo "Creating database backup: ${BACKUP_FILE}"
mysqldump --host=${DB_HOST} --port=${DB_PORT} --user=${DB_USER} --password=${DB_PASSWORD} --ssl-mode=REQUIRED ${DB_NAME} > ${BACKUP_FILE}

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "Backup completed successfully"
  echo "Backup file: ${BACKUP_FILE}"
else
  echo "Backup failed"
  exit 1
fi