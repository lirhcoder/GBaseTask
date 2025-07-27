@echo off
echo =================================
echo   强制更新同步功能
echo =================================
echo.

echo 1. 备份当前文件...
copy src\services\taskSystem-sqlite.js src\services\taskSystem-sqlite.js.backup 2>nul
echo.

echo 2. 从 GitHub 下载最新版本...
echo.
echo 正在下载最新的 taskSystem-sqlite.js...
curl -L -o src\services\taskSystem-sqlite.js https://raw.githubusercontent.com/lirhcoder/GBaseTask/master/src/services/taskSystem-sqlite.js
echo.

echo 3. 验证下载结果...
echo.
echo 搜索 syncBugsToTasks 方法:
findstr /n "syncBugsToTasks" src\services\taskSystem-sqlite.js
echo.

echo 4. 停止所有 Node.js 进程...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo.
echo =================================
echo   完成！请重新启动服务：
echo =================================
echo.
echo npm start
echo.
pause