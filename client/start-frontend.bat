@echo off
:: Set UTF-8 encoding
chcp 65001 >nul 2>&1

echo.
echo ====================================
echo   Lark Task Management - Frontend
echo ====================================
echo.

cd /d "%~dp0"

echo [1/3] Checking dependencies...
if not exist node_modules (
    echo.
    echo No dependencies found. Installing...
    echo This will take 2-3 minutes...
    echo.
    
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: npm install failed
        pause
        exit /b 1
    )
    
    echo.
    echo Installing UI components...
    call npm install @mui/material @emotion/react @emotion/styled @mui/icons-material axios react-router-dom @tanstack/react-query dayjs
    if errorlevel 1 (
        echo.
        echo ERROR: UI components installation failed
        pause
        exit /b 1
    )
    
    echo.
    echo [OK] All dependencies installed successfully!
) else (
    echo [OK] Dependencies found
)

echo.
echo [2/3] Preparing to start server...
echo.
echo ====================================
echo   Frontend URL: http://localhost:3001
echo   Backend API: http://localhost:3000
echo ====================================
echo.
echo [3/3] Starting development server...
echo.

npm run dev

pause