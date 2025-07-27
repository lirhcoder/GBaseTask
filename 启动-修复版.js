#!/usr/bin/env node

console.log('🚀 Lark 任务管理系统 - SQLite 本地版');
console.log('====================================\n');

// 检查是否有 sqlite3
const checkDependencies = () => {
  try {
    require('sqlite3');
    require('sequelize');
    return true;
  } catch (e) {
    return false;
  }
};

// 如果没有依赖，先安装
if (!checkDependencies()) {
  console.log('⏳ 首次运行，正在安装必要组件...');
  console.log('   这可能需要 1-2 分钟...\n');
  
  const { execSync } = require('child_process');
  try {
    execSync('npm install sqlite3 sequelize', { stdio: 'inherit' });
    console.log('\n✅ 安装完成！\n');
  } catch (error) {
    console.error('❌ 安装失败，请手动运行: npm install sqlite3 sequelize');
    process.exit(1);
  }
}

// 删除旧的数据库文件（如果存在问题）
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'database.sqlite');

if (fs.existsSync(dbPath)) {
  console.log('🔧 检测到现有数据库，正在重置...');
  try {
    fs.unlinkSync(dbPath);
    console.log('✅ 数据库已重置\n');
  } catch (error) {
    console.log('⚠️  无法删除旧数据库，继续启动...\n');
  }
}

// 启动服务器
console.log('🌟 正在启动服务器...\n');

// 设置环境变量
process.env.NODE_ENV = 'development';

// 使用修复后的启动文件
require('./src/index-sqlite.js');