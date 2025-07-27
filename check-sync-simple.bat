@echo off
echo =================================
echo   Check Sync Methods (Simple)
echo =================================
echo.

cd /d C:\development\GBaseTask

echo Searching for syncBugsToTasks in taskSystem-sqlite.js...
echo.
findstr "syncBugsToTasks" src\services\taskSystem-sqlite.js
echo.

if %ERRORLEVEL% == 0 (
    echo [SUCCESS] Method found in file!
    echo.
    echo Now test if it works:
    node test-sync-exists.js
) else (
    echo [ERROR] Method NOT found!
    echo.
    echo Please run: force-update-sync.bat
)

echo.
pause