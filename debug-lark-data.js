// 调试脚本：查看 Lark 多维表格的实际数据结构
require('dotenv').config({ path: '../GBaseTask/.env' });

const LarkClient = require('../GBaseTask/src/services/larkClient');

async function debugLarkData() {
  console.log('========== 调试 Lark 数据结构 ==========\n');
  
  const larkClient = new LarkClient(
    process.env.LARK_APP_ID,
    process.env.LARK_APP_SECRET
  );
  
  await larkClient.initialize();
  
  // Bug 表格
  console.log('1. Bug 表格数据：');
  console.log('表格 ID:', process.env.LARK_BUG_TABLE_ID);
  
  try {
    const appToken = process.env.LARK_APP_TOKEN || 'default_app_token';
    const bugTableId = process.env.LARK_BUG_TABLE_ID;
    
    const bugRecords = await larkClient.getTableRecords(appToken, bugTableId);
    
    if (bugRecords && bugRecords.items && bugRecords.items.length > 0) {
      console.log('\n第一条 Bug 记录的完整结构：');
      console.log(JSON.stringify(bugRecords.items[0], null, 2));
      
      console.log('\n所有字段名：');
      const fields = bugRecords.items[0].fields || {};
      console.log(Object.keys(fields));
      
      console.log('\n前3条记录的关键字段：');
      bugRecords.items.slice(0, 3).forEach((record, index) => {
        console.log(`\n记录 ${index + 1}:`);
        console.log('record_id:', record.record_id);
        console.log('fields:', Object.keys(record.fields || {}));
        if (record.fields) {
          Object.entries(record.fields).forEach(([key, value]) => {
            console.log(`  ${key}:`, typeof value === 'object' ? JSON.stringify(value) : value);
          });
        }
      });
    } else {
      console.log('没有找到 Bug 记录');
    }
  } catch (error) {
    console.error('获取 Bug 数据失败:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 需求表格
  console.log('2. 需求表格数据：');
  console.log('表格 ID:', process.env.LARK_REQUIREMENT_TABLE_ID);
  
  try {
    const appToken = process.env.LARK_APP_TOKEN || 'default_app_token';
    const reqTableId = process.env.LARK_REQUIREMENT_TABLE_ID;
    
    const reqRecords = await larkClient.getTableRecords(appToken, reqTableId);
    
    if (reqRecords && reqRecords.items && reqRecords.items.length > 0) {
      console.log('\n第一条需求记录的完整结构：');
      console.log(JSON.stringify(reqRecords.items[0], null, 2));
      
      console.log('\n所有字段名：');
      const fields = reqRecords.items[0].fields || {};
      console.log(Object.keys(fields));
      
      console.log('\n前3条记录的关键字段：');
      reqRecords.items.slice(0, 3).forEach((record, index) => {
        console.log(`\n记录 ${index + 1}:`);
        console.log('record_id:', record.record_id);
        console.log('fields:', Object.keys(record.fields || {}));
        if (record.fields) {
          Object.entries(record.fields).forEach(([key, value]) => {
            console.log(`  ${key}:`, typeof value === 'object' ? JSON.stringify(value) : value);
          });
        }
      });
    } else {
      console.log('没有找到需求记录');
    }
  } catch (error) {
    console.error('获取需求数据失败:', error.message);
  }
  
  console.log('\n========== 调试结束 ==========');
}

debugLarkData().catch(console.error);