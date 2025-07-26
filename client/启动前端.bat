@echo off
chcp 65001 >nul
echo ========================================
echo   Start Lark Task Management Frontend
echo ========================================
echo.

cd /d "%~dp0"

echo Checking frontend dependencies...
if not exist node_modules (
    echo.
    echo First run, installing frontend dependencies...
    echo This may take 2-3 minutes...
    echo.
    
    call npm install
    
    echo.
    echo Installing UI libraries...
    call npm install @mui/material @emotion/react @emotion/styled @mui/icons-material axios react-router-dom @tanstack/react-query dayjs
) else (
    echo Dependencies already installed
)

echo.
echo ========================================
echo Starting frontend development server...
echo Frontend URL: http://localhost:3001
echo ========================================
echo.

npm run dev

pause