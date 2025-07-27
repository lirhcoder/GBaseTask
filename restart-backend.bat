@echo off
chcp 65001 >nul
echo =====================================
echo   Restarting Backend Server
echo =====================================
echo.

cd /d C:\development\GBaseTask

echo Stopping any running Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo Starting backend server...
start cmd /k "cd /d C:\development\GBaseTask && npm run dev"

echo.
echo Backend server is restarting...
echo Wait a few seconds then test at:
echo http://localhost:3000/api/health
echo.
pause