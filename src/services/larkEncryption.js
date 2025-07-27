const crypto = require('crypto');
const { AESCipher } = require('@larksuiteoapi/node-sdk');

class LarkEncryption {
  constructor(encryptKey) {
    // Lark 使用单独的 Encrypt Key 或 Verification Token
    this.encryptKey = encryptKey || 
                      process.env.LARK_ENCRYPT_KEY || 
                      process.env.LARK_VERIFICATION_TOKEN || 
                      process.env.LARK_APP_SECRET;
    
    console.log('使用加密密钥:', this.encryptKey ? `${this.encryptKey.substring(0, 8)}...` : '未设置');
    
    // 使用 Lark SDK 的 AESCipher
    this.aesCipher = new AESCipher(this.encryptKey);
  }

  /**
   * 解密 Lark 发送的加密数据
   * @param {string} encrypt - Base64 编码的加密数据
   * @returns {object} 解密后的 JSON 对象
   */
  decrypt(encrypt) {
    try {
      console.log('使用 Lark SDK AESCipher 解密...');
      
      // 使用 Lark SDK 的 AESCipher 解密
      const decryptedStr = this.aesCipher.decrypt(encrypt);
      console.log('解密成功:', decryptedStr);
      
      // 解析 JSON
      return JSON.parse(decryptedStr);
      
    } catch (error) {
      console.error('解密失败:', error);
      return null;
    }
  }


  /**
   * 验证 challenge
   * @param {string} encrypt - 加密的请求数据
   * @returns {string|null} challenge 值
   */
  verifyChallenge(encrypt) {
    const decrypted = this.decrypt(encrypt);
    if (decrypted && decrypted.challenge) {
      return decrypted.challenge;
    }
    return null;
  }
}

module.exports = LarkEncryption;