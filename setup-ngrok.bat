@echo off
chcp 65001 >nul
echo =====================================
echo   ngrok Setup Guide
echo =====================================
echo.

REM Check if ngrok exists
where ngrok >nul 2>nul
if %errorlevel% neq 0 (
    echo [Step 1] ngrok not found. Please install it first:
    echo.
    echo 1. Visit https://ngrok.com/download
    echo 2. Download ngrok for Windows
    echo 3. Extract ngrok.exe to a folder
    echo 4. Add that folder to your PATH
    echo.
    echo After installation, run this script again.
    pause
    exit /b 1
)

echo [Step 1] ngrok found! ✓
echo.

REM Check if authtoken is configured
ngrok config check >nul 2>&1
if %errorlevel% neq 0 (
    echo [Step 2] ngrok authtoken not configured!
    echo.
    echo You need to sign up and get your authtoken:
    echo.
    echo 1. Sign up at: https://dashboard.ngrok.com/signup
    echo 2. Get your authtoken at: https://dashboard.ngrok.com/get-started/your-authtoken
    echo 3. Run the command shown on that page:
    echo    ngrok config add-authtoken YOUR_AUTH_TOKEN
    echo.
    echo Example:
    echo    ngrok config add-authtoken 2fqGH3kL8xYZ9aBcDeFgHiJkLmN_1234567890
    echo.
    echo After adding authtoken, you can run start-with-ngrok.bat
    pause
    exit /b 1
)

echo [Step 2] ngrok authtoken configured! ✓
echo.
echo =====================================
echo   ngrok is ready to use!
echo =====================================
echo.
echo You can now run: start-with-ngrok.bat
echo.
pause