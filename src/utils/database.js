const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/lark-task-system';
    
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('数据库连接成功');
    
    mongoose.connection.on('error', (err) => {
      console.error('数据库连接错误:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('数据库连接断开');
    });
    
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('数据库连接已关闭');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
};

module.exports = { connectDatabase };