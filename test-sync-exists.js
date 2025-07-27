// 直接测试同步方法是否存在
console.log('=== 测试同步方法 ===\n');

try {
  // 清除缓存
  delete require.cache[require.resolve('./src/services/taskSystem-sqlite.js')];
  
  // 重新加载模块
  const TaskSystem = require('./src/services/taskSystem-sqlite.js');
  
  console.log('TaskSystem 类加载成功');
  
  // 创建实例
  const taskSystem = new TaskSystem({
    getRecords: async () => ({ items: [] })
  });
  
  // 检查方法
  console.log('\n方法检查:');
  console.log('- syncBugsToTasks:', typeof taskSystem.syncBugsToTasks);
  console.log('- syncRequirementsToTasks:', typeof taskSystem.syncRequirementsToTasks);
  
  if (typeof taskSystem.syncBugsToTasks === 'function') {
    console.log('\n✅ syncBugsToTasks 方法存在！');
    console.log('现在可以重启服务并测试同步功能了。');
  } else {
    console.log('\n❌ syncBugsToTasks 方法不存在！');
    console.log('请运行 force-update-sync.bat 强制更新文件。');
  }
  
} catch (error) {
  console.error('错误:', error.message);
  console.error('\n请检查文件路径和语法错误。');
}