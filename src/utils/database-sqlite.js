const { Sequelize } = require('sequelize');
const path = require('path');

// 创建 SQLite 连接
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false, // 设置为 console.log 可以看到 SQL 查询
  define: {
    timestamps: true,
    underscored: true,
  }
});

// 测试连接
const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite 数据库连接成功');
    
    // 同步所有模型
    await sequelize.sync({ alter: true });
    console.log('数据库表同步完成');
  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDatabase };