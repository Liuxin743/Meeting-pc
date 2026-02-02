const mysql = require('mysql2/promise');
require('dotenv').config();

// 创建数据库连接池（修正2个点：port转数字、补充连接池优化配置）
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT) || 3306, // 转为数字，默认3306
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  charset: 'utf8mb4',
  waitForConnections: true, // 无可用连接时等待（避免直接报错）
  connectionLimit: 10, // 最大连接数（提升稳定性）
  queueLimit: 0 // 排队请求无限制
});

// 测试连接（修正：去掉数组解构 []）
const testDbConnection = async () => {
  try {
    // 正确写法：无需数组解构，直接接收连接对象
    const connection = await pool.getConnection(); 
    console.log('MySQL 数据库连接成功！');
    connection.release(); // 释放连接回连接池（必须释放，否则连接会耗尽）
  } catch (error) {
    console.error('MySQL 数据库连接失败：', error.message);
    process.exit(1);
  }
};

// 导出连接池和测试方法
module.exports = {
  pool,
  testDbConnection
};