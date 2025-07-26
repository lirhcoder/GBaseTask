@echo off
echo Fixing Vite/Rollup issue...
echo.

cd /d "%~dp0"

:: Quick fix - install the missing module directly
npm install @rollup/rollup-win32-x64-msvc

:: Try to start again
echo.
echo Starting dev server...
npm run dev

pause