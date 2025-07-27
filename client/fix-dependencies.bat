@echo off
chcp 65001 >nul 2>&1

echo ====================================
echo   Fixing Frontend Dependencies
echo ====================================
echo.

cd /d "%~dp0"

echo [1/4] Cleaning old dependencies...
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules
)

if exist package-lock.json (
    echo Removing package-lock.json...
    del /f package-lock.json
)

echo.
echo [2/4] Clearing npm cache...
call npm cache clean --force

echo.
echo [3/4] Installing dependencies...
call npm install

if errorlevel 1 (
    echo.
    echo ERROR: npm install failed
    echo Trying with --force flag...
    call npm install --force
)

echo.
echo [4/4] Installing missing rollup dependencies...
call npm install @rollup/rollup-win32-x64-msvc --save-optional

echo.
echo ====================================
echo   Dependencies fixed!
echo   Now starting the dev server...
echo ====================================
echo.

npm run dev

pause