const jwt = require('jsonwebtoken');
const { User } = require('../utils/model-adapter');

// SQLite 版本的认证中间件
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: '请提供认证令牌' });
    }

    console.log('验证 token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Token 解码成功, user id:', decoded.id);
    
    // SQLite 使用 findByPk 而不是 findById
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password', 'refresh_token'] }
    });
    
    if (!user || !user.is_active) {
      console.log('用户不存在或未激活');
      throw new Error();
    }

    console.log('用户验证成功:', user.username);
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('认证失败:', error.message);
    res.status(401).json({ error: '认证失败，请重新登录' });
  }
};

// 权限检查中间件
const authorize = (resource, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: '未认证' });
      }

      // 检查用户是否有指定权限
      const hasPermission = req.user.hasPermission(resource, action);
      
      if (!hasPermission) {
        return res.status(403).json({ 
          error: '权限不足',
          required: { resource, action }
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: '权限检查失败' });
    }
  };
};

// 角色检查中间件
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: '角色权限不足',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

// 可选认证中间件（不强制要求登录）
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password', 'refresh_token'] }
      });
      
      if (user && user.is_active) {
        req.user = user;
        req.token = token;
      }
    }
    
    next();
  } catch (error) {
    // 忽略错误，继续处理请求
    next();
  }
};

// 刷新 Token 中间件
const refreshAuth = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ error: '请提供刷新令牌' });
    }

    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || 'your-refresh-secret'
    );
    
    if (decoded.tokenType !== 'refresh') {
      throw new Error('无效的令牌类型');
    }

    const user = await User.findByPk(decoded.id);
    
    if (!user || !user.is_active || user.refresh_token !== refreshToken) {
      throw new Error();
    }

    req.user = user;
    req.refreshToken = refreshToken;
    next();
  } catch (error) {
    res.status(401).json({ error: '刷新令牌无效或已过期' });
  }
};

// API Key 认证中间件（用于系统间调用）
const apiKeyAuth = async (req, res, next) => {
  try {
    const apiKey = req.header('X-API-Key');
    
    if (!apiKey) {
      return res.status(401).json({ error: '请提供 API Key' });
    }

    // 这里可以从数据库或配置中验证 API Key
    // 暂时使用环境变量中的固定值
    if (apiKey !== process.env.SYSTEM_API_KEY) {
      throw new Error();
    }

    // 为 API Key 认证创建一个系统用户
    req.user = {
      id: 'system',
      username: 'system',
      role: 'admin',
      hasPermission: () => true // 系统用户拥有所有权限
    };
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'API Key 无效' });
  }
};

// 组合认证中间件（支持多种认证方式）
const multiAuth = async (req, res, next) => {
  // 优先尝试 JWT 认证
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    return authenticate(req, res, next);
  }

  // 其次尝试 API Key 认证
  const apiKey = req.header('X-API-Key');
  if (apiKey) {
    return apiKeyAuth(req, res, next);
  }

  // 都没有则返回错误
  res.status(401).json({ error: '请提供认证凭证' });
};

module.exports = {
  authenticate,
  authorize,
  requireRole,
  optionalAuth,
  refreshAuth,
  apiKeyAuth,
  multiAuth
};