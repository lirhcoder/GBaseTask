const fs = require('fs');
const path = require('path');

// 读取损坏的文件
const filePath = path.join(__dirname, '..', 'GBaseTask', 'src', 'index-sqlite.js');
console.log('修复文件:', filePath);
const content = fs.readFileSync(filePath, 'utf8');

// 修复常见的编码损坏
const fixed = content
  // 修复连接相关
  .replace(/连�\?/g, '连接')
  .replace(/初始�\?/g, '初始化')
  
  // 修复数据相关
  .replace(/数据�\?/g, '数据库')
  .replace(/本地数据�\?/g, '本地数据库')
  
  // 修复服务相关
  .replace(/服务�\?/g, '服务器')
  .replace(/系�\?/g, '系统')
  .replace(/任务系�\?/g, '任务系统')
  .replace(/同步服�\?/g, '同步服务')
  .replace(/提醒服�\?/g, '提醒服务')
  
  // 修复端点相关
  .replace(/端�\?/g, '端点')
  .replace(/健康检查端�\?/g, '健康检查端点')
  
  // 修复其他
  .replace(/加密�\?/g, '加密的')
  .replace(/简化路�\?/g, '简化路由')
  .replace(/不存�\?/g, '不存在')
  .replace(/管理�\?/g, '管理员')
  .replace(/默认管理员账�\?/g, '默认管理员账号')
  .replace(/服务初始化完�\?/g, '服务初始化完成')
  .replace(/正在初始化服�\?/g, '正在初始化服务')
  .replace(/如果不存在�\?/g, '如果不存在）')
  .replace(/用于测试页面�\?/g, '用于测试页面）')
  .replace(/SQLite�\?/g, 'SQLite）')
  
  // 修复特定的错误行
  .replace("message: '这是简化版本，使用SQLite本地数据�?", "message: '这是简化版本，使用SQLite本地数据库'")
  .replace("res.status(404).json({ error: '接口不存�? });", "res.status(404).json({ error: '接口不存在' });")
  .replace("console.log(`�?服务器运行在", "console.log(`🚀 服务器运行在")
  .replace("console.log(`📁 数据库文�?", "console.log(`📁 数据库文件:")
  .replace("console.log(`🔍 健康检�?", "console.log(`🔍 健康检查:");

// 写回文件
fs.writeFileSync(filePath, fixed, 'utf8');

console.log('文件编码修复完成！');
console.log('修复的问题：');
console.log('- 连接 (连�?)');
console.log('- 初始化 (初始�?)');
console.log('- 数据库 (数据�?)');
console.log('- 服务器 (服务�?)');
console.log('- 系统 (系�?)');
console.log('- 端点 (端�?)');
console.log('- 不存在 (不存�?)');
console.log('- 管理员 (管理�?)');
console.log('等等...');