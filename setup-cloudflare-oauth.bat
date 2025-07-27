@echo off
chcp 65001 >nul
echo =====================================
echo   Cloudflare OAuth Setup
echo =====================================
echo.
echo Your Cloudflare Tunnel URL:
echo https://es-lamb-dates-nascar.trycloudflare.com
echo.
echo =====================================
echo   Step 1: Update .env file
echo =====================================
echo.
echo Add this line to your .env file:
echo LARK_OAUTH_REDIRECT_URI=https://es-lamb-dates-nascar.trycloudflare.com/api/auth/oauth/lark/callback
echo.
echo =====================================
echo   Step 2: Restart Backend Service
echo =====================================
echo.
echo 1. Stop the current service (Ctrl+C)
echo 2. Run: npm start
echo.
echo =====================================
echo   Step 3: Configure in Lark Platform
echo =====================================
echo.
echo Add this exact URL as redirect URI:
echo https://es-lamb-dates-nascar.trycloudflare.com/api/auth/oauth/lark/callback
echo.
echo Or try the simplified version:
echo https://es-lamb-dates-nascar.trycloudflare.com/lark-callback
echo.
echo =====================================
echo   Step 4: Test OAuth Login
echo =====================================
echo.
echo Visit: https://es-lamb-dates-nascar.trycloudflare.com/test-lark-oauth.html
echo.
echo =====================================
echo   Advantages of Cloudflare:
echo =====================================
echo - NO warning page (unlike ngrok)
echo - Very stable connection
echo - Free to use
echo - Good performance
echo.
pause