@echo off
chcp 65001 >nul 2>&1

echo ====================================
echo   Starting SQLite Version
echo ====================================
echo.

cd /d "%~dp0"

echo Starting backend server with SQLite...
npm start

pause