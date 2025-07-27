@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

echo ====================================
echo   Comprehensive Vite/Rollup Fix
echo ====================================
echo.

cd /d "%~dp0"

:: Check Node.js version
echo Checking Node.js version...
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo Current Node.js version: %NODE_VERSION%

:: Extract major version number
for /f "tokens=2 delims=v." %%a in ("%NODE_VERSION%") do set MAJOR_VERSION=%%a

if %MAJOR_VERSION% geq 22 (
    echo.
    echo WARNING: You are using Node.js v22 which has compatibility issues with Vite/Rollup!
    echo Recommended: Use Node.js v18 or v20 LTS
    echo.
    echo Press any key to continue anyway, or Ctrl+C to cancel...
    pause >nul
)

echo.
echo [Step 1/7] Creating .npmrc configuration...
(
echo legacy-peer-deps=true
echo auto-install-peers=true
echo strict-peer-deps=false
echo shamefully-hoist=true
echo strict-ssl=false
) > .npmrc

echo.
echo [Step 2/7] Completely removing old files...
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules 2>nul
    timeout /t 2 >nul
)
if exist package-lock.json del /f /q package-lock.json
if exist yarn.lock del /f /q yarn.lock
if exist pnpm-lock.yaml del /f /q pnpm-lock.yaml

echo.
echo [Step 3/7] Cleaning all caches...
call npm cache clean --force
call npm cache verify

echo.
echo [Step 4/7] Installing with legacy settings...
call npm install --legacy-peer-deps --force

echo.
echo [Step 5/7] Installing platform-specific Rollup binaries...
call npm install @rollup/rollup-win32-x64-msvc@latest --save-optional --legacy-peer-deps
call npm install @rollup/rollup-win32-ia32-msvc@latest --save-optional --legacy-peer-deps
call npm install @rollup/rollup-win32-arm64-msvc@latest --save-optional --legacy-peer-deps

echo.
echo [Step 6/7] Rebuilding binary dependencies...
call npm rebuild

echo.
echo [Step 7/7] Final verification...
if exist node_modules\@rollup\rollup-win32-x64-msvc (
    echo SUCCESS: Rollup binary found!
    echo.
    echo Starting development server...
    call npm run dev
) else (
    echo.
    echo ERROR: Rollup binary still missing!
    echo.
    echo RECOMMENDED SOLUTIONS:
    echo 1. Downgrade to Node.js v18 or v20 LTS
    echo 2. Use pnpm instead: npm install -g pnpm
    echo 3. Use the test-api.html file instead
    echo.
    pause
)