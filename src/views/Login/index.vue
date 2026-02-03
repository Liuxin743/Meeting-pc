<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">会议系统 - 登录</h2>
      
      <!-- 登录 -->
      <div v-if="isLoginMode">
        <div class="login-tab">
          <button 
            class="tab-btn" 
            :class="{ active: loginType === 'pwd' }"
            @click="switchLoginType('pwd')"
          >
            密码登录
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: loginType === 'code' }"
            @click="switchLoginType('code')"
          >
            验证码登录
          </button>
        </div>

        <div class="login-form">
          <!-- 账号输入 -->
          <div class="form-item">
            <label class="form-label">账号：</label>
            <input 
              v-model="form.login.username" 
              type="text" 
              class="form-input" 
              placeholder="请输入登录账号"
            />
          </div>

          <!-- 密码输入 -->
          <div class="form-item" v-if="loginType === 'pwd'">
            <label class="form-label">密码：</label>
            <input 
              v-model="form.login.password" 
              type="password" 
              class="form-input" 
              placeholder="请输入登录密码"
            />
          </div>

          <!-- 验证码输入 -->
          <div class="form-item" v-if="loginType === 'code'">
            <label class="form-label">验证码：</label>
            <div class="code-input-box">
              <input 
                v-model="form.login.code" 
                type="text" 
                class="form-input code-input" 
                placeholder="请输入6位验证码"
                maxlength="6"
              />
              <button 
                class="get-code-btn" 
                @click="getVerifyCode"
                :disabled="codeBtnDisabled"
              >
                {{ codeBtnText }}
              </button>
            </div>
          </div>

          <!-- 记住密码复选框 -->
          <div class="form-item remember-item" v-if="loginType === 'pwd'">
            <input 
              v-model="form.login.rememberPwd" 
              type="checkbox" 
              class="remember-checkbox"
              id="rememberPwd"
            />
            <label for="rememberPwd" class="remember-label">记住密码</label>
          </div>

          <!-- 登录按钮 -->
          <button @click="handleLogin" class="login-btn">登录</button>

          <!-- 注册入口 -->
          <div class="register-link">
            还没有账号？<span @click="switchToRegister">立即注册</span>
          </div>
        </div>
      </div>

      <!-- 注册 -->
      <div v-else>
        <div class="login-form">
          <h3 class="register-subtitle">创建新账号</h3>
          
          <!-- 注册账号输入 -->
          <div class="form-item">
            <label class="form-label">账号：</label>
            <input 
              v-model="form.register.username" 
              type="text" 
              class="form-input" 
              placeholder="请设置登录账号（唯一）"
            />
          </div>

          <!-- 注册密码输入 -->
          <div class="form-item">
            <label class="form-label">密码：</label>
            <input 
              v-model="form.register.password" 
              type="password" 
              class="form-input" 
              placeholder="请设置密码（不少于6位）"
            />
          </div>

          <!-- 确认密码输入 -->
          <div class="form-item">
            <label class="form-label">确认密码：</label>
            <input 
              v-model="form.register.confirmPwd" 
              type="password" 
              class="form-input" 
              placeholder="请再次输入密码"
            />
          </div>

          <!-- 注册按钮 -->
          <button @click="handleRegister" class="login-btn">注册</button>

          <!-- 登录入口 -->
          <div class="login-link">
            已有账号？<span @click="switchToLogin">返回登录</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/userStore'
import request from '../../utils/request'

// 初始化路由和用户仓库
const router = useRouter()
const userStore = useUserStore() || { loginSuccess: () => {} } 

// 模式控制：true=登录模式（默认），false=注册模式
const isLoginMode = ref(true)
// 登录方式（pwd：密码登录，code：验证码登录）
const loginType = ref('pwd')
// 表单数据：拆分登录和注册表单
const form = ref({
  login: {
    username: '',
    password: '',
    code: '',
    rememberPwd: false
  },
  register: {
    username: '',
    password: '',
    confirmPwd: ''
  }
})
// 验证码按钮状态
const codeBtnDisabled = ref(false)
const codeBtnText = ref('获取验证码')
const codeCountdown = ref(60)

// 切换到注册
const switchToRegister = () => {
  isLoginMode.value = false
  form.value.register = { username: '', password: '', confirmPwd: '' }
  codeBtnDisabled.value = false
  codeBtnText.value = '获取验证码'
  codeCountdown.value = 60
}

// 切换回登录模式
const switchToLogin = () => {
  isLoginMode.value = true
  form.value.login.password = ''
  form.value.login.code = ''
}

// 切换登录方式
const switchLoginType = (type) => {
  loginType.value = type
  if (type === 'pwd') {
    form.value.login.code = ''
  } else {
    form.value.login.password = ''
  }
}

// 从本地存储加载记住的密码
const loadRememberedPwd = () => {
  const rememberedUsername = localStorage.getItem('rememberedUsername')
  const rememberedPwd = localStorage.getItem('rememberedPwd')
  if (rememberedUsername && rememberedPwd) {
    form.value.login.username = rememberedUsername
    form.value.login.password = rememberedPwd
    form.value.login.rememberPwd = true
  }
}

// 获取验证码
const getVerifyCode = async () => {
  const username = form.value.login.username
  if (!username.trim()) {
    alert('请先输入账号！')
    return
  }

  // 禁用按钮，开始倒计时
  codeBtnDisabled.value = true
  codeBtnText.value = `${codeCountdown.value}s 后重新获取`

  try {
    // 调用后端获取验证码接口
    const res = await request.post('/user/getVerifyCode', { username })
    console.log('验证码获取成功：', res.data)
  } catch (error) {
    // 失败后恢复按钮状态
    codeBtnDisabled.value = false
    codeBtnText.value = '获取验证码'
  }

  // 倒计时逻辑
  const timer = setInterval(() => {
    codeCountdown.value--
    codeBtnText.value = `${codeCountdown.value}s 后重新获取`
    if (codeCountdown.value <= 0) {
      clearInterval(timer)
      codeBtnDisabled.value = false
      codeBtnText.value = '获取验证码'
      codeCountdown.value = 60
    }
  }, 1000)
}

// 处理登录（统一入口）
const handleLogin = async () => {
  const loginForm = form.value.login
  // 基础校验
  if (!loginForm.username.trim()) {
    alert('请输入账号！')
    return
  }

  // 按登录方式分别校验
  if (loginType.value === 'pwd') {
    if (!loginForm.password.trim()) {
      alert('请输入密码！')
      return
    }
    // 密码登录
    await handlePwdLogin()
  } else {
    if (!loginForm.code.trim()) {
      alert('请输入验证码！')
      return
    }
    // 验证码登录
    await handleCodeLogin()
  }
}

// 密码登录
const handlePwdLogin = async () => {
  try {
    const loginForm = form.value.login
    const res = await request.post('/user/loginByPwd', {
      username: loginForm.username,
      password: loginForm.password,
      rememberPwd: loginForm.rememberPwd
    })
    const { userInfo, rememberPwd } = res.data

    localStorage.setItem('userName', userInfo.username)
    localStorage.setItem('userAvatar', userInfo.avatar || '')

    // 处理记住密码
    if (rememberPwd) {
      localStorage.setItem('rememberedUsername', loginForm.username)
      localStorage.setItem('rememberedPwd', loginForm.password)
    } else {
      localStorage.removeItem('rememberedUsername')
      localStorage.removeItem('rememberedPwd')
    }

    // 更新 Pinia 状态（可选）
    userStore.loginSuccess(userInfo.username)
    // 跳转首页
    router.push('/home')
  } catch (error) {
    console.error('密码登录失败：', error)
  }
}

// 验证码登录
const handleCodeLogin = async () => {
  try {
    const loginForm = form.value.login
    const res = await request.post('/user/loginByCode', {
      username: loginForm.username,
      code: loginForm.code,
      rememberPwd: loginForm.rememberPwd
    })
    const { userInfo, rememberPwd } = res.data

    localStorage.setItem('userName', userInfo.username)
    localStorage.setItem('userAvatar', userInfo.avatar || '')

    if (rememberPwd) {
      localStorage.setItem('rememberedUsername', loginForm.username)
      localStorage.setItem('token', res.data.token)
    } else {
      localStorage.removeItem('rememberedUsername')
      localStorage.removeItem('token')
    }

    // 更新 Pinia 状态
    userStore.loginSuccess(userInfo.username)
    // 跳转首页
    router.push('/home')
  } catch (error) {
    console.error('验证码登录失败：', error)
  }
}

const handleRegister = async () => {
  const registerForm = form.value.register
  // 前端基础校验
  if (!registerForm.username.trim()) {
    alert('请设置登录账号！')
    return
  }
  if (!registerForm.password.trim()) {
    alert('请设置密码！')
    return
  }
  if (registerForm.password.length < 6) {
    alert('密码长度不能少于6位！')
    return
  }
  if (registerForm.password !== registerForm.confirmPwd) {
    alert('两次输入的密码不一致！')
    return
  }

  try {
    const res = await request.post('/user/register', registerForm)
    alert(res.msg)

    localStorage.setItem('userName', registerForm.username)
    switchToLogin()
    form.value.login.username = registerForm.username
  } catch (error) {
    console.error('用户注册失败：', error)
  }
}

// 页面挂载时加载记住的密码
onMounted(() => {
  loadRememberedPwd()
})
</script>

<style scoped>
/* 登录页面样式 */
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

/* 登录卡片 */
.login-card {
  width: 1000px; 
  padding: 60px; 
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.15);
}

/* 登录标题 */
.login-title {
  text-align: center;
  font-size: 3em; 
  color: #13171b;
  margin-bottom: 40px; 
  font-weight: bold;
}

.login-form{
  font-size: 1em;
}

/* 注册子标题 */
.register-subtitle {
  font-size: 1.8em; 
  color: #333;
  text-align: center;
  margin-bottom: 40px; 
  font-weight: 600;
}

/* 登录方式切换 */
.login-tab {
  display: flex;
  justify-content: center;
  margin-bottom: 40px; 
  gap: 25px;
  font-size: 2em;
}

.tab-btn {
  padding: 14px 28px; 
  background-color: #f5f7fa;
  color: #333;
  border: none;
  border-radius: 8px;
  font-size: 1.3em; 
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background-color: #1989fa;
  color: #fff;
}

/* 表单项目 */
.form-item {
  margin-bottom: 35px; 
}

.form-label {
  display: block;
  font-size: 1.4em; 
  color: #333;
  margin-bottom: 12px; 
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 20px 20px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 1.3em; 
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #1989fa;
}

/* 验证码输入框容器 */
.code-input-box {
  display: flex;
  gap: 15px;
}

.code-input {
  flex: 1;
}

.get-code-btn {
  width: 180px; 
  height: 70px;
  background-color: #1989fa;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.2em; 
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.get-code-btn:disabled {
  background-color: #b3d8ff;
  cursor: not-allowed;
}

/* 记住密码 */
.remember-item {
  display: flex;
  align-items: center;
  margin-bottom: 40px; 
}

.remember-checkbox {
  width: 24px; 
  height: 24px;
  margin-right: 12px;
}

.remember-label {
  font-size: 1.3em; 
  color: #333;
  cursor: pointer;
}

/* 登录/注册按钮 */
.login-btn {
  width: 100%;
  height: 70px;
  background-color: #1989fa;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.4em; 
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-btn:hover {
  background-color: #0e75d8;
}

/* 注册/登录切换 */
.register-link, .login-link {
  text-align: center;
  margin-top: 30px; 
  font-size: 1.3em;
  color: #666;
}

.register-link span, .login-link span {
  color: #1989fa;
  cursor: pointer;
  margin-left: 5px;
  text-decoration: underline;
}

.register-link span:hover, .login-link span:hover {
  color: #0e75d8;
}
</style>