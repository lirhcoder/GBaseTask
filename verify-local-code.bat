@echo off
echo =================================
echo   验证本地代码状态
echo =================================
echo.

echo 1. 检查 Git 状态...
git status
echo.

echo 2. 检查是否有未提交的更改...
git diff --stat
echo.

echo 3. 检查本地与远程的差异...
git fetch origin
git status -uno
echo.

echo 4. 检查 taskSystem-sqlite.js 文件大小...
dir src\services\taskSystem-sqlite.js
echo.

echo 5. 搜索 syncBugsToTasks 方法...
findstr /n "syncBugsToTasks" src\services\taskSystem-sqlite.js
echo.

echo 6. 检查文件末尾内容...
powershell -Command "Get-Content src\services\taskSystem-sqlite.js -Tail 50"
echo.

echo =================================
echo   如果方法不存在，执行以下操作：
echo =================================
echo.
echo 1. 拉取最新代码:
echo    git pull origin master
echo.
echo 2. 如果有冲突:
echo    git stash
echo    git pull origin master
echo    git stash pop
echo.
echo 3. 验证文件更新:
echo    type src\services\taskSystem-sqlite.js | find "syncBugsToTasks"
echo.
pause