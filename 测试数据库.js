console.log('🧪 测试 SQLite 数据库连接和表创建\n');

const testDatabase = async () => {
  try {
    // 1. 测试 SQLite 模块
    console.log('1️⃣ 检查 SQLite 模块...');
    const sqlite3 = require('sqlite3').verbose();
    console.log('✅ SQLite3 模块正常\n');

    // 2. 测试 Sequelize
    console.log('2️⃣ 检查 Sequelize 模块...');
    const { Sequelize } = require('sequelize');
    console.log('✅ Sequelize 模块正常\n');

    // 3. 创建数据库连接
    console.log('3️⃣ 创建数据库连接...');
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: './test-database.sqlite',
      logging: console.log
    });
    console.log('✅ 数据库实例创建成功\n');

    // 4. 测试连接
    console.log('4️⃣ 测试数据库连接...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 5. 创建测试模型
    console.log('5️⃣ 创建测试表...');
    const TestModel = sequelize.define('Test', {
      name: Sequelize.STRING,
      value: Sequelize.INTEGER
    });

    await TestModel.sync({ force: true });
    console.log('✅ 测试表创建成功\n');

    // 6. 插入测试数据
    console.log('6️⃣ 插入测试数据...');
    await TestModel.create({
      name: '测试项',
      value: 123
    });
    console.log('✅ 数据插入成功\n');

    // 7. 查询测试数据
    console.log('7️⃣ 查询测试数据...');
    const data = await TestModel.findAll();
    console.log('✅ 查询结果:', data.map(d => d.toJSON()));

    // 8. 关闭连接
    await sequelize.close();
    console.log('\n🎉 所有测试通过！SQLite 工作正常。');

    // 清理测试文件
    const fs = require('fs');
    if (fs.existsSync('./test-database.sqlite')) {
      fs.unlinkSync('./test-database.sqlite');
      console.log('🧹 测试数据库已清理');
    }

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('详细错误:', error);
  }
};

// 运行测试
testDatabase();