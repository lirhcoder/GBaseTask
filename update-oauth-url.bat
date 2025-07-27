@echo off
chcp 65001 >nul
echo =====================================
echo   Update OAuth Redirect URL
echo =====================================
echo.
echo Current ngrok URL from your screenshot:
echo https://2b78283dedc6.ngrok-free.app
echo.
echo Please update your .env file with:
echo.
echo LARK_OAUTH_REDIRECT_URI=https://2b78283dedc6.ngrok-free.app/api/auth/oauth/lark/callback
echo.
echo Then restart the backend service:
echo 1. Press Ctrl+C in the npm start window
echo 2. Run: npm start
echo.
echo After updating, the OAuth callback should work correctly.
echo.
pause