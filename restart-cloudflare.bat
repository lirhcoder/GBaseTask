@echo off
echo =================================
echo   重启 Cloudflare Tunnel
echo =================================
echo.

echo 1. 停止所有 cloudflared 进程...
taskkill /F /IM cloudflared.exe 2>nul
timeout /t 2 >nul

echo.
echo 2. 清理缓存（如果需要）...
rmdir /s /q "%USERPROFILE%\.cloudflared\logs" 2>nul

echo.
echo 3. 启动新的 Cloudflare tunnel...
echo.
echo 启动命令：cloudflared tunnel --url http://localhost:3001
echo.
echo =================================
echo   请在新窗口运行以下命令：
echo =================================
echo.
echo cloudflared tunnel --url http://localhost:3001
echo.
echo 或者尝试：
echo cloudflared tunnel --url http://localhost:3001 --no-autoupdate
echo.
echo =================================
echo   如果仍有问题，尝试：
echo =================================
echo.
echo 1. 使用具体协议：
echo    cloudflared tunnel --url http://127.0.0.1:3001
echo.
echo 2. 指定 hostname：
echo    cloudflared tunnel --url http://localhost:3001 --hostname donor-skirt-anthony-cookie.trycloudflare.com
echo.
echo 3. 使用调试模式：
echo    cloudflared tunnel --url http://localhost:3001 --loglevel debug
echo.
pause