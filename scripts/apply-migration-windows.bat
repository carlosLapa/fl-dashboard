@echo off
echo This script will apply database migrations to PRODUCTION.
echo.

cd ..\backend

if not exist flyway.conf (
  echo Error: flyway.conf not found in backend directory.
  echo Please create this file with the correct database connection details.
  pause
  exit /b 1
)

echo Showing pending migrations:
mvn flyway:info -Dflyway.configFiles=flyway.conf

echo.
set /p confirmation=Are you sure you want to apply these migrations? (yes/no): 

if not "%confirmation%"=="yes" (
  echo Operation cancelled.
  pause
  exit /b 0
)

echo.
echo Applying migrations...
mvn flyway:migrate -Dflyway.configFiles=flyway.conf

if %ERRORLEVEL% equ 0 (
  echo.
  echo Migrations applied successfully.
) else (
  echo.
  echo Migration failed. Please check the logs.
)

pause