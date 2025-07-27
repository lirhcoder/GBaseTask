// 调试同步问题的脚本
const path = require('path');

console.log('========== 调试同步问题 ==========\n');

// 设置环境变量确保加载 SQLite 版本
process.argv[1] = 'index-sqlite.js';

console.log('1. 检查 SyncService 类定义:');
console.log('-'.repeat(50));
try {
  const SyncService = require('../GBaseTask/src/services/syncService');
  console.log('✓ SyncService 类已加载');
  console.log('构造函数参数:', SyncService.prototype.constructor.length);
  console.log('方法列表:', Object.getOwnPropertyNames(SyncService.prototype));
} catch (error) {
  console.log('✗ 加载 SyncService 失败:', error.message);
}

console.log('\n2. 检查 TaskSystem 类定义:');
console.log('-'.repeat(50));
try {
  const TaskSystem = require('../GBaseTask/src/services/taskSystem-sqlite');
  console.log('✓ TaskSystem 类已加载');
  const instance = new TaskSystem();
  console.log('syncBugsToTasks 存在:', typeof instance.syncBugsToTasks === 'function');
  console.log('syncRequirementsToTasks 存在:', typeof instance.syncRequirementsToTasks === 'function');
  console.log('syncAllToTasks 存在:', typeof instance.syncAllToTasks === 'function');
} catch (error) {
  console.log('✗ 加载 TaskSystem 失败:', error.message);
}

console.log('\n3. 模拟初始化流程:');
console.log('-'.repeat(50));
try {
  const TaskSystem = require('../GBaseTask/src/services/taskSystem-sqlite');
  const SyncService = require('../GBaseTask/src/services/syncService');
  
  console.log('创建 TaskSystem 实例...');
  const taskSystem = new TaskSystem();
  
  console.log('创建 SyncService 实例（错误的方式）...');
  try {
    const syncService1 = new SyncService('larkClient', taskSystem);
    console.log('✗ 错误方式创建成功（不应该成功）');
    console.log('syncService1.taskSystem 类型:', typeof syncService1.taskSystem);
    console.log('syncService1.taskSystem 是字符串:', syncService1.taskSystem === 'larkClient');
  } catch (error) {
    console.log('✓ 错误方式创建失败:', error.message);
  }
  
  console.log('\n创建 SyncService 实例（正确的方式）...');
  const syncService2 = new SyncService(taskSystem);
  console.log('✓ 正确方式创建成功');
  console.log('syncService2.taskSystem 类型:', typeof syncService2.taskSystem);
  console.log('syncService2.taskSystem.syncBugsToTasks 存在:', 
    typeof syncService2.taskSystem.syncBugsToTasks === 'function');
  
  console.log('\n测试调用 syncBugsOnly...');
  // 不实际调用，只检查是否会报错
  console.log('syncService2.syncBugsOnly 存在:', typeof syncService2.syncBugsOnly === 'function');
  
} catch (error) {
  console.log('✗ 模拟失败:', error.message);
  console.log(error.stack);
}

console.log('\n========== 问题诊断 ==========');
console.log('\n当前的问题是 index-sqlite.js 中传递了错误的参数给 SyncService:');
console.log('错误: new SyncService(larkClient, taskSystem)');
console.log('正确: new SyncService(taskSystem)');
console.log('\n这导致 SyncService 内部的 this.taskSystem 实际上是 larkClient 对象，');
console.log('而不是 TaskSystem 实例，所以调用 syncBugsToTasks 时会报错。');