#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log(`
====================================
    任务管理系统启动助手
====================================
`);

// 检查是否有 MongoDB 运行
function checkMongoDB() {
  return new Promise((resolve) => {
    const net = require('net');
    const client = new net.Socket();
    
    client.setTimeout(1000);
    
    client.on('connect', () => {
      client.destroy();
      resolve(true);
    });
    
    client.on('timeout', () => {
      client.destroy();
      resolve(false);
    });
    
    client.on('error', () => {
      resolve(false);
    });
    
    client.connect(27017, 'localhost');
  });
}

async function main() {
  const mongoRunning = await checkMongoDB();
  
  if (mongoRunning) {
    console.log('✓ 检测到 MongoDB 正在运行');
    console.log('  推荐使用 MongoDB 版本以获得完整功能');
    console.log();
    console.log('启动选项：');
    console.log('1. 使用 MongoDB 版本（推荐）');
    console.log('2. 使用 SQLite 版本（本地文件）');
  } else {
    console.log('✗ 未检测到 MongoDB');
    console.log('  将使用 SQLite 版本（无需安装数据库）');
    console.log();
    
    // 直接启动 SQLite 版本
    console.log('正在启动 SQLite 版本...');
    const child = spawn('node', ['src/index-sqlite.js'], {
      stdio: 'inherit',
      env: process.env
    });
    
    child.on('error', (error) => {
      console.error('启动失败:', error);
      process.exit(1);
    });
    
    return;
  }
  
  // 如果有 MongoDB，让用户选择
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('请选择 (1/2): ', (answer) => {
    rl.close();
    
    let entryFile;
    if (answer === '1') {
      entryFile = 'src/index.js';
      console.log('\n正在启动 MongoDB 版本...');
    } else {
      entryFile = 'src/index-sqlite.js';
      console.log('\n正在启动 SQLite 版本...');
    }
    
    const child = spawn('node', [entryFile], {
      stdio: 'inherit',
      env: process.env
    });
    
    child.on('error', (error) => {
      console.error('启动失败:', error);
      process.exit(1);
    });
  });
}

main().catch(console.error);