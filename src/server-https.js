require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');

// 数据库初始化
const initDatabase = require('./utils/init-database');

// 初始化服务
async function startServer() {
  console.log('正在初始化服务...');
  
  // 初始化数据库
  await initDatabase();
  
  // 导入 app（必须在数据库初始化之后）
  const app = require('./app');
  
  // HTTPS 配置
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, '../certs/localhost-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../certs/localhost.pem'))
  };
  
  const PORT = process.env.PORT || 3001;
  
  // 创建 HTTPS 服务器
  const server = https.createServer(httpsOptions, app);
  
  server.listen(PORT, () => {
    console.log(`🔒 HTTPS 服务器运行在: https://localhost:${PORT}`);
    console.log('📝 API 文档: https://localhost:' + PORT + '/api-docs');
    console.log('🧪 OAuth 测试: https://localhost:' + PORT + '/test-lark-oauth.html');
  });
  
  // 优雅关闭
  process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信号，正在关闭服务器...');
    server.close(() => {
      console.log('服务器已关闭');
      process.exit(0);
    });
  });
}

// 启动服务器
startServer().catch(err => {
  console.error('服务器启动失败:', err);
  process.exit(1);
});