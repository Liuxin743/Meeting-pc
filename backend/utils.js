const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 1. MD5 加密（用于密码加密）
const md5Encrypt = (str) => {
  const md5 = crypto.createHash('md5');
  return md5.update(str).digest('hex');
};

// 2. 生成6位数字验证码
const generateVerifyCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 3. 生成 JWT 令牌
const generateJwtToken = (username) => {
  return jwt.sign(
    { username }, // 载荷：存储用户名
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// 4. 验证 JWT 令牌（可选，用于后续接口权限校验）
const verifyJwtToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// 导出工具方法
module.exports = {
  md5Encrypt,
  generateVerifyCode,
  generateJwtToken,
  verifyJwtToken
};