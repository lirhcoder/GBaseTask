// 测试新的 Encrypt Key
const { AESCipher } = require('@larksuiteoapi/node-sdk');

// 您提供的密钥
const ENCRYPT_KEY = 'sJoVjUwk11X2RHNbnOUqpb';
const VERIFICATION_TOKEN = 'kititgrCMZ7ZXhI2wyO59fnBavJg6MMI';

// 测试数据
const testEncrypt = 'wGOZREUK7MosZatqz8rLpt0xYlpm/FpEBVOLf4R9tCMKRkzJTFWLII4S4xKh0/7NxtDB9L2yqBNAWq2g7X1AVoHl4F5/Wmpx1HA4zs5G0JLoEQPovwmm8H6Z0V1Z42GoFkviK4d7b4bK+mo4X3Ems6+/rDzoBWdlB4t+/7euhbRBOfgBAswMvqCwGHYEq0zi';

console.log('=== 测试 Lark Encrypt Key ===\n');

// 测试 Encrypt Key
console.log('1. 使用 Encrypt Key:', ENCRYPT_KEY);
try {
  const cipher1 = new AESCipher(ENCRYPT_KEY);
  const decrypted1 = cipher1.decrypt(testEncrypt);
  console.log('✓ 解密成功!');
  console.log('解密结果:', decrypted1);
  
  try {
    const parsed = JSON.parse(decrypted1);
    console.log('JSON 内容:', parsed);
    if (parsed.challenge) {
      console.log('Challenge 值:', parsed.challenge);
    }
  } catch (e) {
    console.log('JSON 解析失败');
  }
} catch (error) {
  console.log('✗ 解密失败:', error.message);
}

console.log('\n2. 使用 Verification Token:', VERIFICATION_TOKEN);
try {
  const cipher2 = new AESCipher(VERIFICATION_TOKEN);
  const decrypted2 = cipher2.decrypt(testEncrypt);
  console.log('✓ 解密成功!');
  console.log('解密结果:', decrypted2);
  
  try {
    const parsed = JSON.parse(decrypted2);
    console.log('JSON 内容:', parsed);
    if (parsed.challenge) {
      console.log('Challenge 值:', parsed.challenge);
    }
  } catch (e) {
    console.log('JSON 解析失败');
  }
} catch (error) {
  console.log('✗ 解密失败:', error.message);
}

console.log('\n如果其中一个成功，请使用成功的密钥更新 .env 文件');
console.log('LARK_ENCRYPT_KEY=使用成功的密钥');