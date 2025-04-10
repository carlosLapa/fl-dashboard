@echo off
REM Script to manually apply Flyway migrations to DigitalOcean database

setlocal EnableDelayedExpansion

REM Load environment variables from backend directory
if exist "%~dp0..\backend\.env" (
  for /F "tokens=*" %%A in (%~dp0..\backend\.env) do (
    set %%A
  )
) else (
  echo Error: backend\.env file not found
  exit /b 1
)

REM Confirm before proceeding
echo This script will apply database migrations to PRODUCTION.
echo Database: %DB_NAME% on %DB_HOST%
set /p confirmation="Are you sure you want to continue? (yes/no): "

if not "%confirmation%"=="yes" (
  echo Operation cancelled.
  exit /b 0
)

REM Create backup first
call "%~dp0backup-db.bat"

if %ERRORLEVEL% NEQ 0 (
  echo Backup failed. Aborting migration.
  exit /b 1
)

REM Show migration info
echo Migration information:
cd "%~dp0..\backend"
call mvn flyway:info "-Dflyway.url=jdbc:mysql://%DB_HOST%:%DB_PORT%/%DB_NAME%?sslMode=REQUIRED" "-Dflyway.user=%DB_USER%" "-Dflyway.password=%DB_PASSWORD%"

REM Final confirmation
set /p final_confirmation="Ready to apply migrations. Type 'APPLY' to continue: "
if not "%final_confirmation%"=="APPLY" (
  echo Migration cancelled.
  exit /b 0
)

REM Apply migrations
echo Applying migrations...
call mvn flyway:migrate "-Dflyway.url=jdbc:mysql://%DB_HOST%:%DB_PORT%/%DB_NAME%?sslMode=REQUIRED" "-Dflyway.user=%DB_USER%" "-Dflyway.password=%DB_PASSWORD%"

endlocal