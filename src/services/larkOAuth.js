const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class LarkOAuthService {
  constructor(appId, appSecret) {
    this.appId = appId;
    this.appSecret = appSecret;
    // 使用国际版 API 域名
    this.baseURL = 'https://open.larksuite.com';
    this.redirectUri = process.env.LARK_OAUTH_REDIRECT_URI || 'http://localhost:3001/api/auth/oauth/lark/callback';
  }

  /**
   * 获取 OAuth 授权 URL
   * @param {string} state - 用于防止 CSRF 攻击的随机字符串
   * @returns {string} 授权 URL
   */
  getAuthorizationURL(state) {
    console.log('生成 OAuth URL, redirect_uri:', this.redirectUri);
    
    const params = new URLSearchParams({
      app_id: this.appId,
      redirect_uri: this.redirectUri,
      state: state,
      response_type: 'code',
      // 添加必要的权限范围
      // 暂时只请求基本信息，不请求邮箱权限
      scope: 'contact:user.base:readonly'
    });

    // 使用正确的授权域名
    const authUrl = `https://accounts.larksuite.com/open-apis/authen/v1/authorize?${params.toString()}`;
    console.log('生成的授权 URL:', authUrl);
    
    return authUrl;
  }

  /**
   * 使用授权码换取访问令牌
   * @param {string} code - 授权码
   * @returns {Promise<Object>} 包含 access_token 和 refresh_token 的对象
   */
  async getAccessToken(code) {
    try {
      console.log('获取 App Access Token...');
      const appAccessToken = await this.getAppAccessToken();
      console.log('App Access Token 获取成功');
      
      console.log('使用授权码换取用户 token...');
      const response = await axios.post(
        `${this.baseURL}/open-apis/authen/v1/oidc/access_token`,
        {
          grant_type: 'authorization_code',
          code: code
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${appAccessToken}`
          }
        }
      );

      console.log('Token 交换响应:', response.data);
      
      if (response.data.code !== 0) {
        console.error('Token 交换失败:', response.data);
        throw new Error(`获取访问令牌失败: ${response.data.msg}`);
      }

      return response.data.data;
    } catch (error) {
      console.error('获取访问令牌失败:', error);
      throw error;
    }
  }

  /**
   * 获取应用访问令牌 (App Access Token)
   * @returns {Promise<string>} App Access Token
   */
  async getAppAccessToken() {
    try {
      const response = await axios.post(
        `${this.baseURL}/open-apis/auth/v3/app_access_token/internal`,
        {
          app_id: this.appId,
          app_secret: this.appSecret
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.code !== 0) {
        throw new Error(`获取应用访问令牌失败: ${response.data.msg}`);
      }

      return response.data.app_access_token;
    } catch (error) {
      console.error('获取应用访问令牌失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户信息
   * @param {string} userAccessToken - 用户访问令牌
   * @returns {Promise<Object>} 用户信息
   */
  async getUserInfo(userAccessToken) {
    try {
      console.log('获取用户信息 API URL:', `${this.baseURL}/open-apis/authen/v1/user_info`);
      console.log('使用 access_token:', userAccessToken ? '已提供' : '未提供');
      
      const response = await axios.get(
        `${this.baseURL}/open-apis/authen/v1/user_info`,
        {
          headers: {
            'Authorization': `Bearer ${userAccessToken}`
          }
        }
      );

      console.log('用户信息 API 响应:', response.data);
      
      if (response.data.code !== 0) {
        console.error('用户信息 API 返回错误:', response.data);
        throw new Error(`获取用户信息失败: ${response.data.msg}`);
      }

      return response.data.data;
    } catch (error) {
      console.error('获取用户信息失败 - 详细错误:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * 刷新访问令牌
   * @param {string} refreshToken - 刷新令牌
   * @returns {Promise<Object>} 新的访问令牌信息
   */
  async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post(
        `${this.baseURL}/open-apis/authen/v1/oidc/refresh_access_token`,
        {
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await this.getAppAccessToken()}`
          }
        }
      );

      if (response.data.code !== 0) {
        throw new Error(`刷新访问令牌失败: ${response.data.msg}`);
      }

      return response.data.data;
    } catch (error) {
      console.error('刷新访问令牌失败:', error);
      throw error;
    }
  }

  /**
   * 生成 OAuth state 参数
   * @returns {string} 随机生成的 state
   */
  generateState() {
    return uuidv4();
  }
}

module.exports = LarkOAuthService;