@echo off
chcp 65001 >nul
echo =====================================
echo   Start with Cloudflare Tunnel
echo =====================================
echo.

REM Check if cloudflared is installed
where cloudflared >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] cloudflared not found
    echo.
    echo Please install Cloudflare Tunnel first:
    echo.
    echo 1. Download from:
    echo    https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation
    echo.
    echo 2. Windows direct download:
    echo    https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
    echo.
    echo 3. Rename to cloudflared.exe and add to PATH
    echo.
    pause
    exit /b 1
)

echo [1/3] Starting backend service...
start cmd /k "cd /d %~dp0 && npm start"

echo [2/3] Waiting for service to start...
timeout /t 5 /nobreak >nul

echo.
echo [3/3] Starting Cloudflare Tunnel...
echo.
echo The tunnel URL will be shown in the new window.
start cmd /k "cloudflared tunnel --url http://localhost:3001"

echo.
echo =====================================
echo   Setup Instructions
echo =====================================
echo.
echo 1. Copy the URL from Cloudflare Tunnel window
echo    Example: https://random-name.trycloudflare.com
echo.
echo 2. Update .env file with the URL
echo.
echo 3. Add to Lark Developer Platform
echo.
echo 4. Restart backend after updating .env
echo.
echo Advantages:
echo - No warning page
echo - Free to use
echo - Very stable
echo - Good performance
echo.
pause