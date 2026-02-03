const express = require('express');
const { pool } = require('../db');
const { md5Encrypt, generateVerifyCode, generateJwtToken } = require('../utils');
require('dotenv').config();

const router = express.Router();
const CODE_EXPIRE_MINUTES = parseInt(process.env.CODE_EXPIRE_MINUTES);

// 1. 接口：获取验证码（POST /api/user/getVerifyCode）
router.post('/getVerifyCode', async (req, res) => {
  try {
    const { username } = req.body;
    // 校验参数
    if (!username) {
      return res.status(400).json({ code: 400, msg: '请输入账号！' });
    }

    // 第一步：查询用户是否存在
    const [userRows] = await pool.execute(
      'SELECT * FROM `user` WHERE `username` = ?',
      [username]
    );
    if (userRows.length === 0) {
      return res.status(404).json({ code: 404, msg: '该账号不存在！' });
    }

    // 第二步：生成6位验证码和过期时间
    const code = generateVerifyCode();
    const expireTime = new Date(Date.now() + CODE_EXPIRE_MINUTES * 60 * 1000); // 5分钟后过期

    // 第三步：删除该账号已存在的旧验证码（避免重复）
    await pool.execute(
      'DELETE FROM `verify_code` WHERE `username` = ?',
      [username]
    );

    // 第四步：插入新验证码到数据库
    await pool.execute(
      'INSERT INTO `verify_code` (`username`, `code`, `expire_time`) VALUES (?, ?, ?)',
      [username, code, expireTime]
    );

    // 注意：真实项目中，这里需要对接短信服务商（如阿里云、腾讯云）发送验证码到用户手机/邮箱
    // 本示例直接返回验证码（仅用于测试）
    res.status(200).json({
      code: 200,
      msg: '验证码获取成功（有效期5分钟）',
      data: { code } // 生产环境请删除该字段，仅测试用
    });
  } catch (error) {
    console.error('获取验证码失败：', error.message);
    res.status(500).json({ code: 500, msg: '服务器内部错误！' });
  }
});

// 2. 接口：验证码登录（POST /api/user/loginByCode）
router.post('/loginByCode', async (req, res) => {
  try {
    const { username, code, rememberPwd } = req.body;
    // 校验参数
    if (!username || !code) {
      return res.status(400).json({ code: 400, msg: '请输入账号和验证码！' });
    }

    // 第一步：查询用户是否存在
    const [userRows] = await pool.execute(
      'SELECT * FROM `user` WHERE `username` = ?',
      [username]
    );
    if (userRows.length === 0) {
      return res.status(404).json({ code: 404, msg: '该账号不存在！' });
    }
    const user = userRows[0];

    // 第二步：查询有效的验证码（未过期且匹配）
    const [codeRows] = await pool.execute(
      'SELECT * FROM `verify_code` WHERE `username` = ? AND `code` = ? AND `expire_time` > NOW()',
      [username, code]
    );
    if (codeRows.length === 0) {
      return res.status(400).json({ code: 400, msg: '验证码无效或已过期！' });
    }

    // 第三步：生成 JWT 令牌
    const token = generateJwtToken(username);

    // 第四步：登录成功后，删除该验证码（一次性有效）
    await pool.execute(
      'DELETE FROM `verify_code` WHERE `username` = ?',
      [username]
    );

    // 第五步：返回登录结果（包含用户信息和令牌）
    res.status(200).json({
      code: 200,
      msg: '登录成功！',
      data: {
        token,
        userInfo: {
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar
        },
        rememberPwd: rememberPwd // 标记是否记住密码
      }
    });
  } catch (error) {
    console.error('验证码登录失败：', error.message);
    res.status(500).json({ code: 500, msg: '服务器内部错误！' });
  }
});

// 3. 接口：密码登录（兼容原有功能，POST /api/user/loginByPwd）
router.post('/loginByPwd', async (req, res) => {
  try {
    const { username, password, rememberPwd } = req.body;
    // 校验参数
    if (!username || !password) {
      return res.status(400).json({ code: 400, msg: '请输入账号和密码！' });
    }

    // 第一步：查询用户是否存在
    const [userRows] = await pool.execute(
      'SELECT * FROM `user` WHERE `username` = ?',
      [username]
    );
    if (userRows.length === 0) {
      return res.status(404).json({ code: 404, msg: '该账号不存在！' });
    }
    const user = userRows[0];

    // 第二步：校验密码（加密后对比）
    const encryptPwd = md5Encrypt(password);
    if (encryptPwd !== user.password) {
      return res.status(400).json({ code: 400, msg: '密码错误！' });
    }

    // 第三步：生成 JWT 令牌
    const token = generateJwtToken(username);

    // 第四步：返回登录结果
    res.status(200).json({
      code: 200,
      msg: '登录成功！',
      data: {
        token,
        userInfo: {
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar
        },
        rememberPwd: rememberPwd
      }
    });
  } catch (error) {
    console.error('密码登录失败：', error.message);
    res.status(500).json({ code: 500, msg: '服务器内部错误！' });
  }
});
// 4. 接口：用户注册（POST /api/user/register）
router.post('/register', async (req, res) => {
  try {
    const { username, password, confirmPwd } = req.body;
    // 第一步：参数校验
    if (!username || !password || !confirmPwd) {
      return res.status(400).json({ code: 400, msg: '请填写完整注册信息！' });
    }
    if (password.length < 6) {
      return res.status(400).json({ code: 400, msg: '密码长度不能少于6位！' });
    }
    if (password !== confirmPwd) {
      return res.status(400).json({ code: 400, msg: '两次输入的密码不一致！' });
    }

    // 第二步：校验账号是否已存在
    const [userRows] = await pool.execute(
      'SELECT * FROM `user` WHERE `username` = ?',
      [username]
    );
    if (userRows.length > 0) {
      return res.status(400).json({ code: 400, msg: '该账号已存在，请更换账号！' });
    }

    // 第三步：密码加密（MD5）
    const encryptPwd = md5Encrypt(password);

    // 第四步：插入新用户到数据库
    await pool.execute(
      'INSERT INTO `user` (`username`, `password`, `nickname`) VALUES (?, ?, ?)',
      [username, encryptPwd, `用户${username}`] // 昵称默认拼接账号
    );

    // 第五步：返回注册成功结果
    res.status(200).json({
      code: 200,
      msg: '注册成功！请前往登录',
      data: { username }
    });
  } catch (error) {
    console.error('用户注册失败：', error.message);
    res.status(500).json({ code: 500, msg: '服务器内部错误！' });
  }
});
module.exports = router;