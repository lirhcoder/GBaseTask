@echo off
chcp 65001 >nul 2>&1

echo ====================================
echo   Using Yarn (Alternative Solution)
echo ====================================
echo.

cd /d "%~dp0"

:: Check if yarn is installed
where yarn >nul 2>&1
if errorlevel 1 (
    echo Yarn not found. Installing yarn...
    npm install -g yarn
)

echo.
echo [1/3] Removing old dependencies...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f package-lock.json
if exist yarn.lock del /f yarn.lock

echo.
echo [2/3] Installing dependencies with Yarn...
yarn install

echo.
echo [3/3] Starting dev server...
yarn dev

pause