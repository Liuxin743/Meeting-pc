import axios from 'axios';

// 创建 axios 实例
const request = axios.create({
  baseURL: 'http://localhost:3000/api', // 后端接口基础地址，必须和后端服务端口一致
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
});

// 请求拦截器（保持不变，后续可添加 token 携带等逻辑）
request.interceptors.request.use(
  (config) => {
    // 若后续需要携带 JWT token，可在此处添加
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器（优化：精准捕获后端返回的错误信息）
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    // 1. 后端返回正常数据（无论 code 是否为 200，先返回数据）
    // 2. 非 200 状态（如注册时账号已存在），弹出后端的具体提示
    if (res.code !== 200) {
      alert(res.msg || '操作失败！');
      // 拒绝 Promise，让前端 catch 能捕获到该错误
      return Promise.reject(res);
    }
    // 3. 200 状态直接返回数据，供前端使用
    return res;
  },
  (error) => {
    // 处理网络错误、后端 400/500 等状态码错误
    let errorMsg = '服务器请求失败！';
    
    // 精准捕获后端返回的错误信息（如 400 密码错误、404 账号不存在）
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 400:
          errorMsg = data.msg || '请求参数错误！';
          break;
        case 404:
          errorMsg = data.msg || '请求接口不存在！';
          break;
        case 500:
          errorMsg = data.msg || '服务器内部错误！';
          break;
        default:
          errorMsg = `请求失败，状态码：${status}`;
      }
    } else if (error.request) {
      // 网络错误（无响应）
      errorMsg = '网络异常，请检查网络连接！';
    }
    
    // 弹出精准错误提示
    alert(errorMsg);
    // 拒绝 Promise，让前端 catch 能捕获到该错误
    return Promise.reject(error);
  }
);

export default request;