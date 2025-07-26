@echo off
chcp 65001 >nul 2>&1

echo ====================================
echo   Lark Sync Test Page
echo ====================================
echo.

cd /d "%~dp0"

echo Starting backend server...
start cmd /k "npm start"

echo.
echo Waiting for server to start...
timeout /t 3 >nul

echo.
echo Opening Lark sync test page...
start "" "%cd%\test-lark-sync.html"

echo.
echo ====================================
echo   Server running at: http://localhost:3001
echo   Test page opened in browser
echo ====================================
echo.
echo Press any key to exit...
pause >nul