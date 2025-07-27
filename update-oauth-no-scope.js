// 更新 OAuth 服务，移除 scope 参数
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/services/larkOAuth.js');
let content = fs.readFileSync(filePath, 'utf8');

// 查找当前的 scope 设置
if (content.includes('scope: ')) {
    console.log('找到 scope 参数，准备移除...');
    
    // 注释掉 scope 行
    content = content.replace(
        /scope: 'contact:user\.base:readonly'/,
        "// scope: 'contact:user.base:readonly'  // 暂时禁用，等待权限审批"
    );
    
    fs.writeFileSync(filePath, content);
    console.log('✅ 已更新 larkOAuth.js，移除了 scope 参数');
    console.log('\n下一步：');
    console.log('1. 重启服务: npm start');
    console.log('2. 清除浏览器缓存');
    console.log('3. 重新测试 OAuth 登录');
} else {
    console.log('未找到 scope 参数');
}