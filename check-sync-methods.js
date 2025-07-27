// 检查 TaskSystem 是否有同步方法
const TaskSystem = require('./src/services/taskSystem-sqlite');

console.log('=== 检查 TaskSystem-SQLite 方法 ===\n');

// 创建实例
const taskSystem = new TaskSystem(null);

// 检查方法是否存在
console.log('syncBugsToTasks 方法存在:', typeof taskSystem.syncBugsToTasks === 'function');
console.log('syncRequirementsToTasks 方法存在:', typeof taskSystem.syncRequirementsToTasks === 'function');

// 列出所有方法
console.log('\n所有方法:');
const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(taskSystem))
  .filter(name => typeof taskSystem[name] === 'function' && name !== 'constructor');

methods.forEach(method => {
  console.log(`- ${method}`);
});

console.log('\n如果看不到 syncBugsToTasks，说明:');
console.log('1. 文件没有保存');
console.log('2. 运行的是缓存的旧版本');
console.log('3. 需要重启 Node.js 进程');