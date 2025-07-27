// 调试 Lark 加密解密
require('dotenv').config();
const crypto = require('crypto');
const { AESCipher } = require('@larksuiteoapi/node-sdk');

// 测试数据 - 从您的日志中获取
const testEncrypt = 'wGOZREUK7MosZatqz8rLpt0xYlpm/FpEBVOLf4R9tCMKRkzJTFWLII4S4xKh0/7NxtDB9L2yqBNAWq2g7X1AVoHl4F5/Wmpx1HA4zs5G0JLoEQPovwmm8H6Z0V1Z42GoFkviK4d7b4bK+mo4X3Ems6+/rDzoBWdlB4t+/7euhbRBOfgBAswMvqCwGHYEq0zi';

console.log('=== Lark 加密解密调试 ===\n');

// 获取配置
const APP_ID = process.env.LARK_APP_ID || 'cli_a8ad6e051b38d02d';
const APP_SECRET = process.env.LARK_APP_SECRET || 'CuOlnNl2F7BPNQLi9ZLRNDbuKrvwlaaT';

console.log('App ID:', APP_ID);
console.log('App Secret:', APP_SECRET);
console.log('Encrypt Data Length:', testEncrypt.length);
console.log();

// 尝试不同的密钥生成方式
const testKeys = [
  {
    name: 'Direct App Secret',
    key: APP_SECRET
  },
  {
    name: 'SHA256 of App Secret',
    key: crypto.createHash('sha256').update(APP_SECRET).digest('hex')
  },
  {
    name: 'SHA256 Buffer of App Secret',
    key: crypto.createHash('sha256').update(APP_SECRET).digest()
  },
  {
    name: 'First 32 chars of App Secret',
    key: APP_SECRET.padEnd(32, '0').slice(0, 32)
  },
  {
    name: 'MD5 of App Secret (32 chars)',
    key: crypto.createHash('md5').update(APP_SECRET).digest('hex')
  }
];

// 测试每种密钥
testKeys.forEach((testKey, index) => {
  console.log(`\n测试 ${index + 1}: ${testKey.name}`);
  console.log('Key:', typeof testKey.key === 'string' ? testKey.key : '<Buffer>');
  
  try {
    const cipher = new AESCipher(testKey.key);
    const decrypted = cipher.decrypt(testEncrypt);
    console.log('✓ 解密成功!');
    console.log('解密结果:', decrypted);
    
    try {
      const parsed = JSON.parse(decrypted);
      console.log('JSON 解析成功:', parsed);
      if (parsed.challenge) {
        console.log('Challenge:', parsed.challenge);
      }
    } catch (e) {
      console.log('JSON 解析失败:', e.message);
    }
    
  } catch (error) {
    console.log('✗ 解密失败:', error.message);
  }
});

// 手动解密尝试
console.log('\n\n=== 手动解密尝试 ===\n');

function manualDecrypt(key, encrypt) {
  try {
    const encryptBuffer = Buffer.from(encrypt, 'base64');
    console.log('Encrypted buffer length:', encryptBuffer.length);
    
    // 前16字节是IV
    const iv = encryptBuffer.slice(0, 16);
    const encrypted = encryptBuffer.slice(16);
    
    console.log('IV length:', iv.length);
    console.log('Encrypted data length:', encrypted.length);
    
    // 确保密钥是32字节
    let keyBuffer;
    if (typeof key === 'string') {
      if (key.length === 32) {
        keyBuffer = Buffer.from(key);
      } else if (key.length === 64) {
        // 可能是hex字符串
        keyBuffer = Buffer.from(key, 'hex');
      } else {
        // 使用SHA256生成32字节密钥
        keyBuffer = crypto.createHash('sha256').update(key).digest();
      }
    } else {
      keyBuffer = key;
    }
    
    console.log('Key buffer length:', keyBuffer.length);
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

// 测试手动解密
console.log('\n使用 App Secret 直接解密:');
console.log(manualDecrypt(APP_SECRET, testEncrypt));

console.log('\n使用 SHA256(App Secret) 解密:');
console.log(manualDecrypt(crypto.createHash('sha256').update(APP_SECRET).digest(), testEncrypt));

// 检查是否需要其他参数
console.log('\n\n=== 其他可能性 ===\n');
console.log('1. 可能需要 Verification Token 而不是 App Secret');
console.log('2. 可能需要 Encrypt Key（在 Lark 应用设置中单独配置）');
console.log('3. 可能需要组合多个参数生成密钥');

// 如果有 Verification Token
if (process.env.LARK_VERIFICATION_TOKEN) {
  console.log('\n使用 Verification Token:');
  const vToken = process.env.LARK_VERIFICATION_TOKEN;
  try {
    const cipher = new AESCipher(vToken);
    const decrypted = cipher.decrypt(testEncrypt);
    console.log('✓ 使用 Verification Token 解密成功!');
    console.log('解密结果:', decrypted);
  } catch (error) {
    console.log('✗ 使用 Verification Token 解密失败');
  }
}