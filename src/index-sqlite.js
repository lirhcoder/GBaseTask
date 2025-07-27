require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const LarkEncryption = require('./services/larkEncryption');

// 导入数据库连�?
const { connectDatabase } = require('./utils/database-sqlite');

// 导入服务
const LarkClient = require('./services/larkClient');
const TaskSystem = require('./services/taskSystem-sqlite');
const SyncService = require('./services/syncService');
const ReminderService = require('./services/reminderService');

// 导入路由
const { router: tasksRouter, setTaskSystem } = require('./routes/tasks');
const { router: syncRouter, setSyncService } = require('./routes/sync');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');

// 初始�?Express 应用
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务（用于测试页面�?
app.use(express.static(path.join(__dirname, '..')));

// 健康检查端�?
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
    name: 'Lark Task Management System (SQLite�?',
    version: '1.0.0',
    database: 'SQLite',
    endpoints: {
      health: '/health',
      message: '这是简化版本，使用SQLite本地数据�?
    }
  });
});

// Lark OAuth 简化回调路由（备选方案）
app.all('/lark-callback', (req, res) => {
  console.log('Lark callback 请求:', {
    method: req.method,
    query: req.query,
    body: req.body,
    headers: req.headers
  });
  
  const params = { ...req.query, ...req.body };
  const { challenge, encrypt } = params;
  
  // 处理加密�?challenge
  if (encrypt) {
    console.log('Lark 加密 challenge 请求');
    const encryption = new LarkEncryption();
    const decrypted = encryption.decrypt(encrypt);
    
    if (decrypted && decrypted.challenge) {
      console.log('解密成功, challenge:', decrypted.challenge);
      return res.json({ challenge: decrypted.challenge });
    } else {
      console.error('解密失败');
      return res.status(400).json({ error: '解密失败' });
    }
  }
  
  // 处理明文 challenge
  if (challenge) {
    console.log('Lark challenge 验证 (简化路�?:', challenge);
    return res.json({ challenge });
  }
  
  // 转发到主回调处理
  req.url = '/api/auth/oauth/lark/callback';
  req.originalUrl = '/api/auth/oauth/lark/callback' + (req._parsedUrl.search || '');
  app.handle(req, res);
});

// 调试路由 - 测试 challenge 响应
app.all('/test-challenge', (req, res) => {
  const params = { ...req.query, ...req.body };
  console.log('Test challenge 请求:', params);
  
  if (params.challenge) {
    return res.json({ challenge: params.challenge });
  }
  
  res.json({ 
    message: 'Challenge test endpoint',
    received: params,
    instruction: 'Send challenge parameter to get it echoed back'
  });
});

// 注册路由
app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/sync', syncRouter);
app.use('/api/users', usersRouter);

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存�? });
});

// 启动服务�?
// 支持通过命令行参数指定端口：npm start -- --port 3002
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const PORT = portIndex !== -1 && args[portIndex + 1] 
  ? parseInt(args[portIndex + 1]) 
  : process.env.PORT || 3001;

async function startServer() {
  try {
    // 连接数据�?
    await connectDatabase();
    
    // 确保模型已加�?
    const User = require('./models/User-sqlite');
    const Task = require('./models/Task-sqlite');
    
    // 强制同步所有模型（创建表）
    await User.sync({ alter: true });
    await Task.sync({ alter: true });
    console.log('数据库表创建/更新完成');
    
    // 初始化服�?
    console.log('正在初始化服�?..');
    
    // 初始�?Lark 客户�?
    const larkClient = new LarkClient(
      process.env.LARK_APP_ID,
      process.env.LARK_APP_SECRET
    );
    
    // 初始化任务系�?
    const taskSystem = new TaskSystem();
    setTaskSystem(taskSystem);
    
    // 初始化同步服�?
    const syncService = new SyncService(taskSystem);
    setSyncService(syncService);
    
    // 初始化提醒服�?
    const reminderService = new ReminderService(taskSystem);
    
    console.log('服务初始化完�?);
    
    // 创建默认用户（如果不存在�?
    const defaultUser = await User.findOne({ where: { username: 'admin' } });
    if (!defaultUser) {
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        displayName: '管理�?,
        role: 'admin',
        permissions: new User().getDefaultPermissions()
      });
      console.log('创建默认管理员账�? admin / admin123');
    }
    
    app.listen(PORT, () => {
      console.log(`\n========================================`);
      console.log(`�?服务器运行在 http://localhost:${PORT}`);
      console.log(`📁 数据库文�? database.sqlite`);
      console.log(`🔍 健康检�? http://localhost:${PORT}/health`);
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
