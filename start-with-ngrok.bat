@echo off
chcp 65001 >nul
echo =====================================
echo   Lark OAuth Development with ngrok
echo =====================================
echo.

REM Check ngrok
where ngrok >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] ngrok not found
    echo.
    echo Please run setup-ngrok.bat first to install and configure ngrok.
    echo.
    pause
    exit /b 1
)

REM Check ngrok authtoken
ngrok config check >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] ngrok authtoken not configured
    echo.
    echo Please run setup-ngrok.bat to configure ngrok authtoken.
    echo.
    pause
    exit /b 1
)

echo [1/4] Starting backend service...
start /min cmd /k "cd /d %~dp0 && npm start"

echo [2/4] Waiting for service to start...
timeout /t 5 /nobreak >nul

echo.
echo [3/4] Starting ngrok tunnel...
start cmd /k "ngrok http 3001"

echo.
echo [4/4] Waiting for ngrok...
timeout /t 3 /nobreak >nul

echo.
echo =====================================
echo   Setup Instructions
echo =====================================
echo.
echo 1. Copy HTTPS URL from ngrok window
echo    Example: https://abc123.ngrok.io
echo.
echo 2. Add redirect URL in Lark Developer Platform:
echo    https://[your-ngrok-domain]/api/auth/oauth/lark/callback
echo.
echo 3. Update .env file:
echo    LARK_OAUTH_REDIRECT_URI=https://[your-ngrok-domain]/api/auth/oauth/lark/callback
echo.
echo 4. Restart backend service (Ctrl+C then npm start)
echo.
echo 5. Visit test page:
echo    https://[your-ngrok-domain]/test-lark-oauth.html
echo.
pause