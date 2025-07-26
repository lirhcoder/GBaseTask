const { sequelize } = require('./database-sqlite');
const path = require('path');
const fs = require('fs');

async function initDatabase() {
  console.log('📊 初始化数据库...');
  
  try {
    // 测试连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 加载所有模型
    const User = require('../models/User-sqlite');
    const Task = require('../models/Task-sqlite');

    // 同步所有模型（创建表）
    console.log('🔨 创建数据库表...');
    
    // 使用 force: true 会删除现有表并重新创建
    // 使用 alter: true 会尝试修改现有表以匹配模型
    await sequelize.sync({ force: true });
    
    console.log('✅ 数据库表创建成功');

    // 创建默认数据
    console.log('📝 创建默认数据...');
    
    // 创建管理员用户
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      displayName: '系统管理员',
      role: 'admin',
      permissions: [
        { resource: 'tasks', actions: ['create', 'read', 'update', 'delete', 'export'] },
        { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'sync', actions: ['create', 'read', 'update', 'delete', 'sync'] }
      ]
    });
    console.log('✅ 创建管理员账号: admin / admin123');

    // 创建示例任务
    const sampleTasks = [
      {
        id: `task_${Date.now()}_1`,
        title: '欢迎使用 Lark 任务管理系统',
        type: 'task',
        status: 'completed',
        priority: 'medium',
        assignee: 'admin',
        description: '这是一个示例任务，展示系统的基本功能。'
      },
      {
        id: `task_${Date.now()}_2`,
        title: '配置飞书应用凭证',
        type: 'task',
        status: 'pending',
        priority: 'high',
        assignee: 'admin',
        description: '请在 .env 文件中配置你的飞书应用 ID 和密钥。'
      },
      {
        id: `task_${Date.now()}_3`,
        title: '测试数据同步功能',
        type: 'task',
        status: 'pending',
        priority: 'medium',
        assignee: 'admin',
        description: '配置完成后，可以测试从飞书多维表格同步数据。'
      }
    ];

    for (const taskData of sampleTasks) {
      await Task.create(taskData);
    }
    console.log('✅ 创建示例任务');

    console.log('\n🎉 数据库初始化完成！\n');
    
    return true;
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    throw error;
  }
}

// 如果直接运行此文件
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('初始化成功！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('初始化失败:', error);
      process.exit(1);
    });
}

module.exports = { initDatabase };