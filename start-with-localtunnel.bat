@echo off
chcp 65001 >nul
echo =====================================
echo   Start with localtunnel (No Warning Page)
echo =====================================
echo.

REM Check if localtunnel is installed
where lt >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] localtunnel not found
    echo.
    echo Please install localtunnel first:
    echo   npm install -g localtunnel
    echo.
    echo After installation, run this script again.
    pause
    exit /b 1
)

echo [1/3] Starting backend service...
start cmd /k "cd /d %~dp0 && npm start"

echo [2/3] Waiting for service to start...
timeout /t 5 /nobreak >nul

echo.
echo [3/3] Starting localtunnel...
echo.
echo Note: localtunnel may ask for password on first use
start cmd /k "lt --port 3001 --subdomain lark-oauth-test"

echo.
echo =====================================
echo   Setup Instructions
echo =====================================
echo.
echo 1. localtunnel URL (no warning page!):
echo    https://lark-oauth-test.loca.lt
echo.
echo 2. Update .env file:
echo    LARK_OAUTH_REDIRECT_URI=https://lark-oauth-test.loca.lt/api/auth/oauth/lark/callback
echo.
echo 3. Add to Lark Developer Platform:
echo    https://lark-oauth-test.loca.lt/api/auth/oauth/lark/callback
echo.
echo 4. Restart backend after updating .env
echo.
echo Advantages over ngrok:
echo - No warning page
echo - Free to use
echo - Stable subdomain
echo.
pause