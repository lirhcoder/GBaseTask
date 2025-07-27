#!/usr/bin/env node

console.log('🚀 Lark 任务管理系统 - 极简版');
console.log('================================\n');

// 检查是否有 sqlite3
try {
  require('sqlite3');
  require('sequelize');
} catch (e) {
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

// 启动服务器
console.log('🌟 正在启动服务器...\n');
require('./src/index-sqlite.js');