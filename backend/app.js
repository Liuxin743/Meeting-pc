const express = require('express');
const cors = require('cors');
const { testDbConnection } = require('./db');
const userRouter = require('./routes/user');
require('dotenv').config();

// 创建 Express 实例
const app = express();
const PORT = 3000;

// 中间件配置
app.use(cors()); // 允许跨域
app.use(express.json()); // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true })); // 解析表单请求体

// 挂载路由
app.use('/api/user', userRouter);

// 测试接口
app.get('/', (req, res) => {
  res.send('会议系统后端接口服务运行中！');
});

// 启动服务并测试数据库连接
const startServer = async () => {
  await testDbConnection();
  app.listen(PORT, () => {
    console.log(`后端服务启动成功，运行在：http://localhost:${PORT}`);
  });
};

// 启动服务
startServer();