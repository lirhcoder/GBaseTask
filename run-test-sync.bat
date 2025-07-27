@echo off
echo =================================
echo   运行同步方法测试
echo =================================
echo.

cd /d C:\development\GBaseTask

echo 运行测试脚本...
echo.
node test-sync-exists.js

echo.
echo =================================
echo   测试完成
echo =================================
echo.
echo 如果显示"syncBugsToTasks 方法存在"，说明代码已更新
echo 如果显示"syncBugsToTasks 方法不存在"，请运行 force-update-sync.bat
echo.
pause