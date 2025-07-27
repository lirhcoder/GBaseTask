const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'GBaseTask', 'src', 'index-sqlite.js');

console.log('读取并修复文件:', filePath);

// 读取文件内容
let content = fs.readFileSync(filePath, 'utf8');

// 定义所有需要修复的替换规则
const replacements = [
  // 基础修复
  [/连�\?/g, '连接'],
  [/初始�\?/g, '初始化'],
  [/数据�\?/g, '数据库'],
  [/服务�\?/g, '服务器'],
  [/系�\?/g, '系统'],
  [/端�\?/g, '端点'],
  [/客户�\?/g, '客户端'],
  [/任务系�\?/g, '任务系统'],
  [/同步服�\?/g, '同步服务'],
  [/提醒服�\?/g, '提醒服务'],
  [/服�\?/g, '服务'],
  [/管理�\?/g, '管理员'],
  [/账�\?/g, '账号'],
  [/不存�\?/g, '不存在'],
  [/完�\?/g, '完成'],
  [/文�\?/g, '文件'],
  [/检�\?/g, '检查'],
  [/�\?/g, '🚀'],
  
  // 特定行修复
  [/SQLite�\?'/g, "SQLite)'"],
  [/用于测试页面�\?/g, '用于测试页面）'],
  [/SQLite本地数据�\?/g, "SQLite本地数据库'"],
  [/加密�\?challenge/g, '加密的challenge'],
  [/简化路�\?:/g, '简化路由):'],
  [/接口不存�\? }/g, "接口不存在' }"],
  [/如果不存在�\?/g, '如果不存在）'],
  [/服务初始化完�\?/g, "服务初始化完成'"],
  [/正在初始化服�\?\.\./g, '正在初始化服务...'],
  [/确保模型已加�\?/g, '确保模型已加载'],
  [/管理�\?,/g, "管理员',"],
  [/默认管理员账�\?/g, '默认管理员账号'],
  [/数据库文�\?/g, '数据库文件'],
  [/健康检�\?/g, '健康检查'],
];

// 应用所有替换
replacements.forEach(([pattern, replacement]) => {
  content = content.replace(pattern, replacement);
});

// 写回文件
fs.writeFileSync(filePath, content, 'utf8');

console.log('文件修复完成！');

// 验证文件语法
const { execSync } = require('child_process');
try {
  execSync(`node --check "${filePath}"`, { encoding: 'utf8' });
  console.log('✅ 语法检查通过！');
} catch (error) {
  console.error('❌ 语法检查失败！');
  console.error(error.stdout || error.message);
  
  // 显示问题行
  const lines = content.split('\n');
  const errorMatch = error.stdout.match(/:(\d+)/);
  if (errorMatch) {
    const lineNum = parseInt(errorMatch[1]);
    console.log('\n问题所在行:');
    for (let i = Math.max(0, lineNum - 3); i < Math.min(lines.length, lineNum + 2); i++) {
      console.log(`${i + 1}: ${lines[i]}`);
    }
  }
}