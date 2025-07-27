@echo off
echo =====================================
echo   创建本地 HTTPS 证书
echo =====================================
echo.

REM 检查 mkcert
where mkcert >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未找到 mkcert
    echo.
    echo 请先安装 mkcert：
    echo.
    echo 方法一：使用 Chocolatey
    echo   choco install mkcert
    echo.
    echo 方法二：手动下载
    echo   1. 访问 https://github.com/FiloSottile/mkcert/releases
    echo   2. 下载 mkcert-v*-windows-amd64.exe
    echo   3. 重命名为 mkcert.exe
    echo   4. 将其添加到 PATH 环境变量
    echo.
    pause
    exit /b 1
)

echo [1/4] 创建证书目录...
if not exist "certs" mkdir certs

echo [2/4] 安装本地 CA...
mkcert -install

echo [3/4] 生成证书...
cd certs
mkcert localhost 127.0.0.1 ::1

echo [4/4] 重命名证书文件...
if exist "localhost+2.pem" (
    move /y "localhost+2.pem" "localhost.pem"
    move /y "localhost+2-key.pem" "localhost-key.pem"
)

cd ..

echo.
echo =====================================
echo   证书创建成功！
echo =====================================
echo.
echo 证书位置：
echo   - certs/localhost.pem
echo   - certs/localhost-key.pem
echo.
echo 现在可以运行 HTTPS 服务器：
echo   npm run start:https
echo.
pause