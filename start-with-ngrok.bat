@echo off
echo =====================================
echo   Lark OAuth 开发环境启动（ngrok）
echo =====================================
echo.

REM 检查 ngrok
where ngrok >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到 ngrok
    echo.
    echo 请先安装 ngrok：
    echo 1. 访问 https://ngrok.com/download
    echo 2. 下载并解压 ngrok.exe
    echo 3. 将 ngrok.exe 添加到 PATH 环境变量
    echo.
    pause
    exit /b 1
)

echo [1/4] 启动后端服务...
start /min cmd /k "cd /d %~dp0 && npm start"

echo [2/4] 等待服务启动...
timeout /t 5 /nobreak >nul

echo.
echo [3/4] 启动 ngrok 隧道...
start cmd /k "ngrok http 3001"

echo.
echo [4/4] 等待 ngrok 启动...
timeout /t 3 /nobreak >nul

echo.
echo =====================================
echo   设置说明
echo =====================================
echo.
echo 1. 从 ngrok 窗口复制 HTTPS URL
echo    例如：https://abc123.ngrok.io
echo.
echo 2. 在 Lark 开发者平台添加重定向 URL：
echo    https://[你的ngrok域名]/api/auth/oauth/lark/callback
echo.
echo 3. 更新 .env 文件：
echo    LARK_OAUTH_REDIRECT_URI=https://[你的ngrok域名]/api/auth/oauth/lark/callback
echo.
echo 4. 重启后端服务（Ctrl+C 后重新运行 npm start）
echo.
echo 5. 访问测试页面：
echo    https://[你的ngrok域名]/test-lark-oauth.html
echo.
pause