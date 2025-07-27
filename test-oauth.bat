@echo off
echo =================================
echo   Lark OAuth 登录测试
echo =================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

echo [1/3] 启动后端服务...
echo.
start cmd /k "cd /d %~dp0 && npm start"

echo [2/3] 等待服务启动...
timeout /t 5 /nobreak >nul

echo.
echo [3/3] 打开 OAuth 测试页面...
start "" "test-lark-oauth.html"

echo.
echo =================================
echo   OAuth 测试环境已启动！
echo =================================
echo.
echo 请在浏览器中：
echo 1. 点击"使用 Lark 登录"按钮
echo 2. 使用您的公司 Lark 账号登录
echo 3. 授权应用访问您的信息
echo.
echo 提示：
echo - 确保已在 Lark 开发者平台配置重定向 URL
echo - 确保 .env 文件中配置了正确的 App ID 和 Secret
echo.
pause