const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const { authenticate, authorize, requireRole } = require('../middleware/auth');

const router = express.Router();

// 所有用户管理接口都需要认证
router.use(authenticate);

// 获取用户列表（需要用户读取权限）
router.get('/', authorize('users', 'read'), [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('role').optional().isIn(['admin', 'manager', 'developer', 'viewer']),
  query('isActive').optional().isBoolean(),
  query('search').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 20,
      role,
      isActive,
      search,
      sort = '-createdAt'
    } = req.query;

    // 构建查询条件
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { username: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { displayName: new RegExp(search, 'i') }
      ];
    }

    // 分页查询
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -refreshToken')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    res.json({
      users: users.map(u => u.toSafeObject()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

// 获取指定用户详情（需要用户读取权限）
router.get('/:id', authorize('users', 'read'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken');
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json(user.toSafeObject());
  } catch (error) {
    console.error('获取用户详情失败:', error);
    res.status(500).json({ error: '获取用户详情失败' });
  }
});

// 创建用户（需要管理员权限）
router.post('/', requireRole('admin'), [
  body('username').trim().isLength({ min: 3, max: 30 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('displayName').trim().notEmpty(),
  body('role').isIn(['admin', 'manager', 'developer', 'viewer']),
  body('department').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, displayName, role, department } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.username === username ? '用户名已存在' : '邮箱已被注册'
      });
    }

    // 创建用户
    const user = new User({
      username,
      email,
      password,
      displayName,
      role,
      department
    });

    // 设置默认权限
    user.permissions = user.getDefaultPermissions();
    await user.save();

    res.status(201).json({
      message: '用户创建成功',
      user: user.toSafeObject()
    });
  } catch (error) {
    console.error('创建用户失败:', error);
    res.status(500).json({ error: '创建用户失败' });
  }
});

// 更新用户（需要管理员权限）
router.put('/:id', requireRole('admin'), [
  body('displayName').optional().trim().notEmpty(),
  body('role').optional().isIn(['admin', 'manager', 'developer', 'viewer']),
  body('department').optional().trim(),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 不允许修改自己的角色和状态
    if (req.params.id === req.user._id.toString()) {
      if (req.body.role !== undefined || req.body.isActive !== undefined) {
        return res.status(400).json({ error: '不能修改自己的角色或状态' });
      }
    }

    const updates = {};
    const allowedFields = ['displayName', 'role', 'department', 'isActive'];
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // 如果更改了角色，更新权限
    if (updates.role) {
      const tempUser = new User({ role: updates.role });
      updates.permissions = tempUser.getDefaultPermissions();
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      message: '用户更新成功',
      user: user.toSafeObject()
    });
  } catch (error) {
    console.error('更新用户失败:', error);
    res.status(500).json({ error: '更新用户失败' });
  }
});

// 删除用户（需要管理员权限）
router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    // 不允许删除自己
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ error: '不能删除自己的账号' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ message: '用户删除成功' });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({ error: '删除用户失败' });
  }
});

// 重置用户密码（需要管理员权限）
router.post('/:id/reset-password', requireRole('admin'), [
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    user.password = req.body.newPassword;
    await user.save();

    res.json({ message: '密码重置成功' });
  } catch (error) {
    console.error('重置密码失败:', error);
    res.status(500).json({ error: '重置密码失败' });
  }
});

// 更新用户权限（需要管理员权限）
router.put('/:id/permissions', requireRole('admin'), [
  body('permissions').isArray(),
  body('permissions.*.resource').isIn(['tasks', 'bugs', 'requirements', 'sync', 'users', 'reports']),
  body('permissions.*.actions').isArray(),
  body('permissions.*.actions.*').isIn(['create', 'read', 'update', 'delete', 'sync', 'export'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { permissions: req.body.permissions },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      message: '权限更新成功',
      user: user.toSafeObject()
    });
  } catch (error) {
    console.error('更新权限失败:', error);
    res.status(500).json({ error: '更新权限失败' });
  }
});

// 获取用户统计信息（需要管理员权限）
router.get('/statistics/overview', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      roleDistribution,
      recentLogins
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      User.find({ lastLogin: { $exists: true } })
        .sort('-lastLogin')
        .limit(10)
        .select('username displayName lastLogin avatar')
    ]);

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      roleDistribution: roleDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentLogins
    });
  } catch (error) {
    console.error('获取用户统计失败:', error);
    res.status(500).json({ error: '获取用户统计失败' });
  }
});

module.exports = router;