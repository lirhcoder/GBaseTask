require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// 导入数据库连接
const { connectDatabase } = require('./utils/database-sqlite');

// 初始化 Express 应用
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    database: 'SQLite (local file)',
    message: '系统运行正常'
  });
});

// API 信息端点
app.get('/api', (req, res) => {
  res.json({
    name: 'Lark Task Management System (SQLite版)',
    version: '1.0.0',
    database: 'SQLite',
    endpoints: {
      health: '/health',
      message: '这是简化版本，使用SQLite本地数据库'
    }
  });
});

// 示例任务接口（简化版）
app.get('/api/tasks', async (req, res) => {
  try {
    const Task = require('./models/Task-sqlite');
    const tasks = await Task.findAll({
      limit: 20,
      order: [['createdAt', 'DESC']]
    });
    res.json({
      tasks,
      total: await Task.count()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 创建任务
app.post('/api/tasks', async (req, res) => {
  try {
    const Task = require('./models/Task-sqlite');
    const task = await Task.create({
      ...req.body,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 启动服务器
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // 连接数据库
    await connectDatabase();
    
    // 确保模型已加载
    const User = require('./models/User-sqlite');
    const Task = require('./models/Task-sqlite');
    
    // 强制同步所有模型（创建表）
    await User.sync({ alter: true });
    await Task.sync({ alter: true });
    console.log('数据库表创建/更新完成');
    
    // 创建默认用户（如果不存在）
    const defaultUser = await User.findOne({ where: { username: 'admin' } });
    if (!defaultUser) {
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        displayName: '管理员',
        role: 'admin',
        permissions: new User().getDefaultPermissions()
      });
      console.log('创建默认管理员账号: admin / admin123');
    }
    
    app.listen(PORT, () => {
      console.log(`\n========================================`);
      console.log(`✅ 服务器运行在 http://localhost:${PORT}`);
      console.log(`📁 数据库文件: database.sqlite`);
      console.log(`🔍 健康检查: http://localhost:${PORT}/health`);
      console.log(`📊 API 信息: http://localhost:${PORT}/api`);
      console.log(`========================================\n`);
    });
  } catch (error) {
    console.error('启动失败:', error);
    process.exit(1);
  }
}

// 启动应用
startServer();