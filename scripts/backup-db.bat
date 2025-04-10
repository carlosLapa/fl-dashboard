@echo off
REM Script to backup the DigitalOcean database before migrations

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

REM Format date for backup filename
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "BACKUP_DATE=%dt:~0,8%_%dt:~8,6%"
set "BACKUP_FILE=%~dp0..\backups\fldashboard_backup_%BACKUP_DATE%.sql"

REM Create backups directory if it doesn't exist
if not exist "%~dp0..\backups" mkdir "%~dp0..\backups"

REM Create backup
echo Creating database backup: %BACKUP_FILE%
mysqldump --host=%DB_HOST% --port=%DB_PORT% --user=%DB_USER% --password=%DB_PASSWORD% --ssl-mode=REQUIRED %DB_NAME% > "%BACKUP_FILE%"

REM Check if backup was successful
if %ERRORLEVEL% EQU 0 (
  echo Backup completed successfully
  echo Backup file: %BACKUP_FILE%
) else (
  echo Backup failed
  exit /b 1
)

endlocal