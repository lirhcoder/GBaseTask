#!/usr/bin/env node

/**
 * 启动脚本 - 支持自定义端口
 * 使用方法：
 * node start-port.js          # 使用默认端口 3001
 * node start-port.js 3000     # 使用端口 3000
 * node start-port.js --sqlite # 使用 SQLite 版本（默认）
 * node start-port.js --mongodb # 使用 MongoDB 版本
 */

const { spawn } = require('child_process');
const path = require('path');

// 解析命令行参数
const args = process.argv.slice(2);
let port = null;
let useMongoDb = false;

args.forEach(arg => {
  if (arg === '--mongodb') {
    useMongoDb = true;
  } else if (arg === '--sqlite') {
    useMongoDb = false;
  } else if (!isNaN(arg)) {
    port = arg;
  }
});

// 确定要启动的文件
const entryFile = useMongoDb ? 'src/index.js' : 'src/index-sqlite.js';
const dbType = useMongoDb ? 'MongoDB' : 'SQLite';

// 构建启动命令
const nodeArgs = [entryFile];
if (port) {
  nodeArgs.push('--port', port);
}

console.log(`====================================`);
console.log(`  启动 ${dbType} 版本`);
console.log(`  端口: ${port || '默认(3001)'}`);
console.log(`====================================`);
console.log();

// 设置环境变量（如果指定了端口）
const env = { ...process.env };
if (port) {
  env.PORT = port;
}

// 启动服务
const child = spawn('node', nodeArgs, {
  stdio: 'inherit',
  env: env,
  cwd: process.cwd()
});

child.on('error', (error) => {
  console.error('启动失败:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code);
});