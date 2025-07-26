const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate, refreshAuth } = require('../middleware/auth');

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

// OAuth 登录（飞书）
router.post('/oauth/lark', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: '缺少授权码' });
    }

    // TODO: 实现飞书 OAuth 登录逻辑
    // 1. 使用 code 换取 access_token
    // 2. 使用 access_token 获取用户信息
    // 3. 创建或更新用户
    // 4. 生成 JWT token

    res.status(501).json({ error: '飞书登录功能正在开发中' });
  } catch (error) {
    console.error('飞书登录失败:', error);
    res.status(500).json({ error: '飞书登录失败' });
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