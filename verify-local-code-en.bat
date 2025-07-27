@echo off
chcp 65001 >nul
echo =================================
echo   Verify Local Code Status
echo =================================
echo.

echo 1. Check Git status...
git status
echo.

echo 2. Check uncommitted changes...
git diff --stat
echo.

echo 3. Check local vs remote...
git fetch origin
git status -uno
echo.

echo 4. Check taskSystem-sqlite.js file size...
dir src\services\taskSystem-sqlite.js
echo.

echo 5. Search for syncBugsToTasks method...
findstr /n "syncBugsToTasks" src\services\taskSystem-sqlite.js
echo.

echo 6. Check end of file content...
powershell -Command "Get-Content src\services\taskSystem-sqlite.js -Tail 50"
echo.

echo =================================
echo   If method not found, do this:
echo =================================
echo.
echo 1. Pull latest code:
echo    git pull origin master
echo.
echo 2. If conflicts exist:
echo    git stash
echo    git pull origin master
echo    git stash pop
echo.
echo 3. Verify file updated:
echo    type src\services\taskSystem-sqlite.js ^| find "syncBugsToTasks"
echo.
pause