# 修复前端依赖问题

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "   修复前端依赖问题" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# 切换到脚本所在目录
Set-Location $PSScriptRoot

Write-Host "[1/4] 清理旧的依赖..." -ForegroundColor Yellow

# 删除 node_modules
if (Test-Path "node_modules") {
    Write-Host "删除 node_modules 文件夹..." -ForegroundColor Gray
    Remove-Item -Path "node_modules" -Recurse -Force
}

# 删除 package-lock.json
if (Test-Path "package-lock.json") {
    Write-Host "删除 package-lock.json..." -ForegroundColor Gray
    Remove-Item -Path "package-lock.json" -Force
}

Write-Host ""
Write-Host "[2/4] 清理 npm 缓存..." -ForegroundColor Yellow
npm cache clean --force

Write-Host ""
Write-Host "[3/4] 重新安装依赖..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "安装失败，尝试使用 --force 参数..." -ForegroundColor Yellow
    npm install --force
}

Write-Host ""
Write-Host "[4/4] 安装缺失的 rollup 依赖..." -ForegroundColor Yellow
npm install @rollup/rollup-win32-x64-msvc --save-optional

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "   依赖修复完成！" -ForegroundColor Green
Write-Host "   现在启动开发服务器..." -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

# 启动开发服务器
npm run dev