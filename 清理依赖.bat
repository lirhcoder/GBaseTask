@echo off
echo ========================================
echo   清理 npm 依赖和缓存
echo ========================================
echo.
echo 警告：这将删除所有已安装的依赖！
echo.
pause

echo.
echo 正在删除 node_modules 文件夹...
if exist node_modules (
    rmdir /s /q node_modules
    echo node_modules 已删除
) else (
    echo node_modules 不存在
)

echo.
echo 正在删除 package-lock.json...
if exist package-lock.json (
    del /f package-lock.json
    echo package-lock.json 已删除
) else (
    echo package-lock.json 不存在
)

echo.
echo 正在清理 npm 缓存...
npm cache clean --force

echo.
echo ========================================
echo   清理完成！
echo ========================================
echo.
echo 项目已恢复到 npm install 之前的状态
echo 如需重新安装，请运行: npm install
echo.
pause