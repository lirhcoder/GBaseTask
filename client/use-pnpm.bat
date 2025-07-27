@echo off
chcp 65001 >nul 2>&1

echo ====================================
echo   Using pnpm (Works with Node v22)
echo ====================================
echo.

cd /d "%~dp0"

:: Check if pnpm is installed
where pnpm >nul 2>&1
if errorlevel 1 (
    echo Installing pnpm globally...
    call npm install -g pnpm
    echo.
)

echo [1/3] Cleaning old files...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f package-lock.json
if exist yarn.lock del /f yarn.lock
if exist pnpm-lock.yaml del /f pnpm-lock.yaml

echo.
echo [2/3] Installing dependencies with pnpm...
call pnpm install

echo.
echo [3/3] Starting development server...
call pnpm dev

pause