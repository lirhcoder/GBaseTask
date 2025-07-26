#!/usr/bin/env node

/**
 * 飞书认证测试脚本
 * 用于验证飞书 API 配置是否正确
 */

require('dotenv').config();
const LarkClient = require('./src/services/larkClient');

// 添加颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, type = 'info') {
  const color = {
    success: colors.green,
    error: colors.red,
    warning: colors.yellow,
    info: colors.blue
  }[type] || colors.reset;
  
  console.log(`${color}${message}${colors.reset}`);
}

async function testAuth() {
  log('\n=== 飞书认证测试 ===\n', 'info');
  
  // 检查环境变量
  log('1. 检查环境变量配置:', 'info');
  const requiredEnvVars = [
    'LARK_APP_ID',
    'LARK_APP_SECRET',
    'LARK_BUG_TABLE_ID',
    'LARK_REQUIREMENT_TABLE_ID'
  ];
  
  let hasError = false;
  requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
      log(`✓ ${varName}: ${process.env[varName].substring(0, 10)}...`, 'success');
    } else {
      log(`✗ ${varName}: 未配置`, 'error');
      hasError = true;
    }
  });
  
  // 检查 App Token
  if (!process.env.LARK_APP_TOKEN) {
    log('\n⚠️  警告: LARK_APP_TOKEN 未配置', 'warning');
    log('   如果表格 ID 中包含 App Token，将尝试自动提取', 'warning');
  } else {
    log(`✓ LARK_APP_TOKEN: ${process.env.LARK_APP_TOKEN}`, 'success');
  }
  
  if (hasError) {
    log('\n请先配置缺失的环境变量', 'error');
    return;
  }
  
  // 初始化客户端
  log('\n2. 初始化飞书客户端:', 'info');
  const client = new LarkClient(
    process.env.LARK_APP_ID,
    process.env.LARK_APP_SECRET
  );
  
  try {
    await client.initialize();
    log('✓ 客户端初始化成功', 'success');
  } catch (error) {
    log('✗ 客户端初始化失败: ' + error.message, 'error');
    return;
  }
  
  // 测试 API 访问
  log('\n3. 测试 API 访问:', 'info');
  
  // 获取 App Token
  const appToken = process.env.LARK_APP_TOKEN || extractAppToken(process.env.LARK_BUG_TABLE_ID);
  
  if (!appToken) {
    log('✗ 无法获取 App Token，请检查配置', 'error');
    log('\n获取 App Token 的方法:', 'info');
    log('1. 打开飞书/Lark 多维表格', 'info');
    log('2. 复制浏览器地址栏的 URL', 'info');
    log('3. URL 格式: https://xxx.larksuite.com/base/[APP_TOKEN]?table=[TABLE_ID]', 'info');
    log('4. 提取 base/ 后面的部分作为 APP_TOKEN', 'info');
    return;
  }
  
  log(`使用 App Token: ${appToken}`, 'info');
  
  // 测试 Bug 表格访问
  log('\n4. 测试 Bug 表格访问:', 'info');
  try {
    const bugData = await client.getTableRecords(
      appToken,
      process.env.LARK_BUG_TABLE_ID
    );
    log(`✓ Bug 表格访问成功，记录数: ${bugData.items?.length || 0}`, 'success');
    
    if (bugData.items && bugData.items.length > 0) {
      log('\n   示例记录字段:', 'info');
      const fields = Object.keys(bugData.items[0].fields || {});
      fields.slice(0, 5).forEach(field => {
        log(`   - ${field}`, 'info');
      });
      if (fields.length > 5) {
        log(`   ... 还有 ${fields.length - 5} 个字段`, 'info');
      }
    }
  } catch (error) {
    log(`✗ Bug 表格访问失败: ${error.message}`, 'error');
    handleAuthError(error);
  }
  
  // 测试需求表格访问
  log('\n5. 测试需求表格访问:', 'info');
  try {
    const reqData = await client.getTableRecords(
      appToken,
      process.env.LARK_REQUIREMENT_TABLE_ID
    );
    log(`✓ 需求表格访问成功，记录数: ${reqData.items?.length || 0}`, 'success');
    
    if (reqData.items && reqData.items.length > 0) {
      log('\n   示例记录字段:', 'info');
      const fields = Object.keys(reqData.items[0].fields || {});
      fields.slice(0, 5).forEach(field => {
        log(`   - ${field}`, 'info');
      });
      if (fields.length > 5) {
        log(`   ... 还有 ${fields.length - 5} 个字段`, 'info');
      }
    }
  } catch (error) {
    log(`✗ 需求表格访问失败: ${error.message}`, 'error');
    handleAuthError(error);
  }
  
  log('\n=== 测试完成 ===\n', 'info');
}

function extractAppToken(tableId) {
  // 尝试从表格 ID 中提取 App Token
  // 某些情况下，用户可能将整个 URL 或 App Token 作为表格 ID
  if (!tableId) return null;
  
  // 检查是否为完整 URL
  const urlMatch = tableId.match(/\/base\/([^?]+)/);
  if (urlMatch) {
    return urlMatch[1];
  }
  
  // 检查是否已经是 App Token 格式 (bascn...)
  if (tableId.startsWith('basc')) {
    return tableId;
  }
  
  return null;
}

function handleAuthError(error) {
  const errorMessage = error.message || '';
  
  if (errorMessage.includes('99991400')) {
    log('\n错误分析: App ID 或 App Secret 错误', 'error');
    log('解决方案:', 'info');
    log('1. 检查 .env 文件中的 LARK_APP_ID 和 LARK_APP_SECRET', 'info');
    log('2. 确保从飞书开放平台复制了正确的凭证', 'info');
  } else if (errorMessage.includes('99991401') || errorMessage.includes('401')) {
    log('\n错误分析: 认证失败或 Token 无效', 'error');
    log('解决方案:', 'info');
    log('1. 检查 App Token 是否正确', 'info');
    log('2. 确保应用有访问多维表格的权限', 'info');
    log('3. 在飞书开放平台检查应用权限配置', 'info');
  } else if (errorMessage.includes('99991403')) {
    log('\n错误分析: 权限不足', 'error');
    log('解决方案:', 'info');
    log('1. 在飞书开放平台添加以下权限:', 'info');
    log('   - bitable:app', 'info');
    log('   - bitable:app:readonly', 'info');
    log('   - bitable:table:data:read', 'info');
    log('2. 确保应用被添加到多维表格的协作者列表', 'info');
  } else if (errorMessage.includes('99991404')) {
    log('\n错误分析: 资源不存在', 'error');
    log('解决方案:', 'info');
    log('1. 检查表格 ID 是否正确', 'info');
    log('2. 确保多维表格存在且未被删除', 'info');
    log('3. 检查 App Token 是否对应正确的多维表格', 'info');
  }
}

// 运行测试
testAuth().catch(error => {
  log('\n发生未预期的错误: ' + error.message, 'error');
  console.error(error.stack);
});