@echo off
chcp 65001 >nul
echo =====================================
echo   Test Lark Challenge Response
echo =====================================
echo.

echo Testing different callback URLs...
echo.

echo 1. Testing main callback route:
echo    https://2b78283dedc6.ngrok-free.app/api/auth/oauth/lark/callback?challenge=test123
curl -s "https://2b78283dedc6.ngrok-free.app/api/auth/oauth/lark/callback?challenge=test123"
echo.
echo.

echo 2. Testing simplified callback route:
echo    https://2b78283dedc6.ngrok-free.app/lark-callback?challenge=test123
curl -s "https://2b78283dedc6.ngrok-free.app/lark-callback?challenge=test123"
echo.
echo.

echo 3. Testing POST request to main callback:
curl -s -X POST "https://2b78283dedc6.ngrok-free.app/api/auth/oauth/lark/callback" -H "Content-Type: application/json" -d "{\"challenge\":\"test123\"}"
echo.
echo.

echo Expected response for all tests: {"challenge":"test123"}
echo.
echo If any test fails, the route is not working correctly.
echo.
pause