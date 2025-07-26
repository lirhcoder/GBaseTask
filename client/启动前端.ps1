# Lark 任务管理系统 - 前端启动脚本

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   Lark 任务管理系统 - 前端" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 切换到脚本所在目录
Set-Location $PSScriptRoot

Write-Host "[1/3] 检查前端依赖..." -ForegroundColor Yellow

if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "首次运行，正在安装前端依赖..." -ForegroundColor Yellow
    Write-Host "这可能需要 2-3 分钟..." -ForegroundColor Gray
    Write-Host ""
    
    # 安装基础依赖
    Write-Host "安装基础依赖..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "错误：依赖安装失败" -ForegroundColor Red
        Read-Host "按回车键退出"
        exit 1
    }
    
    # 安装 UI 组件库
    Write-Host ""
    Write-Host "安装 UI 组件库..." -ForegroundColor Yellow
    npm install @mui/material @emotion/react @emotion/styled @mui/icons-material axios react-router-dom @tanstack/react-query dayjs
    if ($LASTEXITCODE -ne 0) {
        Write-Host "错误：UI 组件安装失败" -ForegroundColor Red
        Read-Host "按回车键退出"
        exit 1
    }
    
    Write-Host ""
    Write-Host "[✓] 所有依赖安装成功！" -ForegroundColor Green
} else {
    Write-Host "[✓] 依赖已安装" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/3] 准备启动服务器..." -ForegroundColor Yellow
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   前端地址: http://localhost:3001" -ForegroundColor White
Write-Host "   后端 API: http://localhost:3000" -ForegroundColor White
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[3/3] 启动开发服务器..." -ForegroundColor Yellow
Write-Host ""
Write-Host "提示：按 Ctrl+C 可以停止服务器" -ForegroundColor Gray
Write-Host ""

# 启动开发服务器
npm run dev