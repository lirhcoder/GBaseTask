@echo off
chcp 65001 >nul
echo =====================================
echo   Lark OAuth Setup Checker
echo =====================================
echo.

echo Running OAuth configuration check...
echo.

node debug-oauth-config.js

echo.
echo =====================================
echo   Next Steps:
echo =====================================
echo.
echo 1. Copy the redirect URI shown above
echo 2. Go to Lark Developer Platform
echo 3. Remove old redirect URIs
echo 4. Add the new redirect URI exactly as shown
echo 5. Save and wait for challenge verification
echo.
echo If still getting error 20029, try the simplified callback:
echo https://2b78283dedc6.ngrok-free.app/lark-callback
echo.
pause