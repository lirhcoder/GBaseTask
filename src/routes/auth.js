const express = require('express');
const { body, validationResult } = require('express-validator');
const { User } = require('../utils/model-adapter');
// 根据环境选择正确的认证中间件
const isSQLite = process.argv[1] && process.argv[1].includes('index-sqlite.js');
const { authenticate, refreshAuth } = require(isSQLite ? '../middleware/auth-sqlite' : '../middleware/auth');
const LarkOAuthService = require('../services/larkOAuth');
const LarkEncryption = require('../services/larkEncryption');

const router = express.Router();

// 注册验证规则
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('用户名长度必须在3-30个字符之间'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度至少6个字符'),
  body('displayName')
    .trim()
    .notEmpty()
    .withMessage('显示名称不能为空')
];

// 登录验证规则
const loginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('用户名不能为空'),
  body('password')
    .notEmpty()
    .withMessage('密码不能为空')
];

// 用户注册
router.post('/register', registerValidation, async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, displayName, department } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.username === username ? '用户名已存在' : '邮箱已被注册'
      });
    }

    // 创建新用户
    const user = new User({
      username,
      email,
      password,
      displayName,
      department,
      permissions: [] // 将根据角色自动设置默认权限
    });

    // 设置默认权限
    user.permissions = user.getDefaultPermissions();

    await user.save();

    // 生成 token
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();
    
    // 保存 refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      message: '注册成功',
      user: user.toSafeObject(),
      token,
      refreshToken
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '注册失败，请稍后重试' });
  }
});

// 用户登录
router.post('/login', loginValidation, async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // 查找用户（支持用户名或邮箱登录）
    const user = await User.findOne({
      $or: [
        { username },
        { email: username }
      ]
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: '账号已被禁用' });
    }

    // 更新最后登录时间
    await user.updateLastLogin();

    // 生成 token
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();
    
    // 保存 refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: '登录成功',
      user: user.toSafeObject(),
      token,
      refreshToken
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '登录失败，请稍后重试' });
  }
});

// 刷新 Token
router.post('/refresh', refreshAuth, async (req, res) => {
  try {
    const user = req.user;

    // 生成新的 token
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();
    
    // 更新 refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: 'Token 刷新成功',
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Token 刷新失败:', error);
    res.status(500).json({ error: 'Token 刷新失败' });
  }
});

// 退出登录
router.post('/logout', authenticate, async (req, res) => {
  try {
    const user = req.user;
    
    // 清除 refresh token
    user.refreshToken = null;
    await user.save();

    res.json({ message: '退出登录成功' });
  } catch (error) {
    console.error('退出登录失败:', error);
    res.status(500).json({ error: '退出登录失败' });
  }
});

// 获取当前用户信息
router.get('/me', authenticate, (req, res) => {
  res.json({
    user: req.user.toSafeObject()
  });
});

// 更新用户信息
router.put('/me', authenticate, [
  body('displayName').optional().trim().notEmpty(),
  body('department').optional().trim(),
  body('preferences.theme').optional().isIn(['light', 'dark', 'auto']),
  body('preferences.language').optional().isIn(['zh-CN', 'en-US'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = {};
    const allowedFields = ['displayName', 'department', 'avatar', 'preferences'];
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      message: '用户信息更新成功',
      user: user.toSafeObject()
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ error: '更新失败' });
  }
});

// 修改密码
router.put('/me/password', authenticate, [
  body('oldPassword').notEmpty().withMessage('请输入原密码'),
  body('newPassword').isLength({ min: 6 }).withMessage('新密码长度至少6个字符')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    // 验证原密码
    if (!(await user.comparePassword(oldPassword))) {
      return res.status(401).json({ error: '原密码错误' });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({ error: '修改密码失败' });
  }
});

// OAuth 状态存储（生产环境应使用 Redis 或数据库）
const oauthStates = new Map();

// 获取 OAuth 授权 URL
router.get('/oauth/lark/authorize', (req, res) => {
  try {
    const oauthService = new LarkOAuthService(
      process.env.LARK_APP_ID,
      process.env.LARK_APP_SECRET
    );
    
    const state = oauthService.generateState();
    // 存储 state，5分钟后过期
    oauthStates.set(state, {
      timestamp: Date.now(),
      returnUrl: req.query.returnUrl || '/'
    });
    
    // 清理过期的 state
    for (const [key, value] of oauthStates.entries()) {
      if (Date.now() - value.timestamp > 5 * 60 * 1000) {
        oauthStates.delete(key);
      }
    }
    
    const authUrl = oauthService.getAuthorizationURL(state);
    res.json({ authUrl, state });
  } catch (error) {
    console.error('获取授权 URL 失败:', error);
    res.status(500).json({ error: '获取授权 URL 失败' });
  }
});

// OAuth 回调处理 - 支持 GET 和 POST
router.all('/oauth/lark/callback', async (req, res) => {
  try {
    // 合并 query 和 body 参数
    const params = { ...req.query, ...req.body };
    const { code, state, challenge, encrypt } = params;
    
    // 处理加密的 challenge
    if (encrypt) {
      console.log('Lark 加密 challenge 请求');
      const encryption = new LarkEncryption();
      const decrypted = encryption.decrypt(encrypt);
      
      if (decrypted && decrypted.challenge) {
        console.log('解密成功, challenge:', decrypted.challenge);
        return res.json({ challenge: decrypted.challenge });
      } else {
        console.error('解密失败或没有 challenge');
        return res.status(400).json({ error: '解密失败' });
      }
    }
    
    // 处理明文 challenge（备用）
    if (challenge) {
      console.log('Lark 明文 challenge 验证:', challenge);
      return res.json({ challenge });
    }
    
    if (!code || !state) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    // 验证 state
    const stateData = oauthStates.get(state);
    if (!stateData) {
      return res.status(400).json({ error: '无效的 state 参数' });
    }
    oauthStates.delete(state);
    
    const oauthService = new LarkOAuthService(
      process.env.LARK_APP_ID,
      process.env.LARK_APP_SECRET
    );
    
    // 使用授权码换取访问令牌
    console.log('OAuth 回调 - 使用授权码换取 token, code:', code);
    const tokenData = await oauthService.getAccessToken(code);
    console.log('获取到 token 数据:', {
      access_token: tokenData.access_token ? '已获取' : '未获取',
      expires_in: tokenData.expire,
      refresh_token: tokenData.refresh_token ? '已获取' : '未获取'
    });
    
    // 获取用户信息
    console.log('开始获取用户信息...');
    const larkUserInfo = await oauthService.getUserInfo(tokenData.access_token);
    console.log('获取到用户信息:', larkUserInfo);
    
    // 查找或创建本地用户
    let user;
    if (isSQLite) {
      // SQLite 使用 where 子句
      user = await User.findOne({ where: { larkUserId: larkUserInfo.user_id } });
    } else {
      // MongoDB 直接使用对象
      user = await User.findOne({ larkUserId: larkUserInfo.user_id });
    }
    
    if (!user) {
      // 创建新用户
      const userData = {
        username: larkUserInfo.en_name || larkUserInfo.name || larkUserInfo.user_id,
        email: larkUserInfo.email || `${larkUserInfo.user_id}@lark.user`,
        displayName: larkUserInfo.name,
        larkUserId: larkUserInfo.user_id,
        avatar: larkUserInfo.avatar_url,
        department: larkUserInfo.department_ids?.[0] || '',
        role: 'user',
        isActive: true,
        password: require('crypto').randomBytes(32).toString('hex')
      };
      
      if (isSQLite) {
        // SQLite 使用 create 方法
        user = await User.create(userData);
      } else {
        // MongoDB 使用 new 和 save
        user = new User(userData);
        user.larkAccessToken = tokenData.access_token;
        user.larkRefreshToken = tokenData.refresh_token;
        user.larkTokenExpiry = new Date(Date.now() + tokenData.expire * 1000);
        await user.save();
      }
    } else {
      // 更新现有用户的 Lark 令牌
      if (isSQLite) {
        // SQLite 使用 update 方法
        await user.update({
          avatar: larkUserInfo.avatar_url
        });
      } else {
        // MongoDB 直接修改属性
        user.larkAccessToken = tokenData.access_token;
        user.larkRefreshToken = tokenData.refresh_token;
        user.larkTokenExpiry = new Date(Date.now() + tokenData.expire * 1000);
        user.avatar = larkUserInfo.avatar_url;
        await user.save();
      }
    }
    
    // 生成 JWT token
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();
    
    // 保存 refresh token
    user.refreshToken = refreshToken;
    await user.save();
    
    // 重定向到前端，带上 token
    const returnUrl = stateData.returnUrl || '/';
    const redirectUrl = new URL(returnUrl, process.env.FRONTEND_URL || 'http://localhost:5173');
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('refreshToken', refreshToken);
    
    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('OAuth 回调处理失败:', error);
    res.status(500).json({ error: 'OAuth 认证失败' });
  }
});

// 使用授权码登录（用于前端 AJAX 请求）
router.post('/oauth/lark', async (req, res) => {
  try {
    const { code, state } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: '缺少授权码' });
    }
    
    // 如果提供了 state，验证它
    if (state) {
      const stateData = oauthStates.get(state);
      if (!stateData) {
        return res.status(400).json({ error: '无效的 state 参数' });
      }
      oauthStates.delete(state);
    }
    
    const oauthService = new LarkOAuthService(
      process.env.LARK_APP_ID,
      process.env.LARK_APP_SECRET
    );
    
    // 使用授权码换取访问令牌
    console.log('OAuth 回调 - 使用授权码换取 token, code:', code);
    const tokenData = await oauthService.getAccessToken(code);
    console.log('获取到 token 数据:', {
      access_token: tokenData.access_token ? '已获取' : '未获取',
      expires_in: tokenData.expire,
      refresh_token: tokenData.refresh_token ? '已获取' : '未获取'
    });
    
    // 获取用户信息
    console.log('开始获取用户信息...');
    const larkUserInfo = await oauthService.getUserInfo(tokenData.access_token);
    console.log('获取到用户信息:', larkUserInfo);
    
    // 查找或创建本地用户
    let user;
    if (isSQLite) {
      // SQLite 使用 where 子句
      user = await User.findOne({ where: { larkUserId: larkUserInfo.user_id } });
    } else {
      // MongoDB 直接使用对象
      user = await User.findOne({ larkUserId: larkUserInfo.user_id });
    }
    
    if (!user) {
      // 创建新用户
      const userData = {
        username: larkUserInfo.en_name || larkUserInfo.name || larkUserInfo.user_id,
        email: larkUserInfo.email || `${larkUserInfo.user_id}@lark.user`,
        displayName: larkUserInfo.name,
        larkUserId: larkUserInfo.user_id,
        avatar: larkUserInfo.avatar_url,
        department: larkUserInfo.department_ids?.[0] || '',
        role: 'user',
        isActive: true,
        password: require('crypto').randomBytes(32).toString('hex')
      };
      
      if (isSQLite) {
        // SQLite 使用 create 方法
        user = await User.create(userData);
      } else {
        // MongoDB 使用 new 和 save
        user = new User(userData);
        user.larkAccessToken = tokenData.access_token;
        user.larkRefreshToken = tokenData.refresh_token;
        user.larkTokenExpiry = new Date(Date.now() + tokenData.expire * 1000);
        await user.save();
      }
    } else {
      // 更新现有用户的 Lark 令牌
      if (isSQLite) {
        // SQLite 使用 update 方法
        await user.update({
          avatar: larkUserInfo.avatar_url
        });
      } else {
        // MongoDB 直接修改属性
        user.larkAccessToken = tokenData.access_token;
        user.larkRefreshToken = tokenData.refresh_token;
        user.larkTokenExpiry = new Date(Date.now() + tokenData.expire * 1000);
        user.avatar = larkUserInfo.avatar_url;
        await user.save();
      }
    }
    
    // 生成 JWT token
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();
    
    // 保存 refresh token
    user.refreshToken = refreshToken;
    await user.save();
    
    res.json({
      message: 'Lark 登录成功',
      user: user.toSafeObject(),
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Lark 登录失败:', error);
    res.status(500).json({ error: 'Lark 登录失败' });
  }
});

// 验证 Token
router.post('/verify', authenticate, (req, res) => {
  res.json({
    valid: true,
    user: req.user.toSafeObject()
  });
});

module.exports = router;