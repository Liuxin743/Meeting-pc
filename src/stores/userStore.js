// src/stores/userStore.js
import { defineStore } from 'pinia'

// 定义用户仓库，存储登录状态
export const useUserStore = defineStore('user', {
  // 状态数据
  state: () => ({
    // 是否登录（默认未登录）
    isLogin: false,
    // 用户名（可选，登录后存储）
    username: ''
  }),
  // 同步方法（修改状态）
  actions: {
    // 登录成功：更新状态
    loginSuccess(username) {
      this.isLogin = true
      this.username = username
      // 本地存储（防止页面刷新后登录状态丢失）
      localStorage.setItem('isLogin', 'true')
      localStorage.setItem('username', username)
    },
    // 退出登录：重置状态
    logout() {
      this.isLogin = false
      this.username = ''
      // 清除本地存储
      localStorage.removeItem('isLogin')
      localStorage.removeItem('username')
    },
    // 初始化：页面刷新后恢复登录状态
    initLoginState() {
      const isLogin = localStorage.getItem('isLogin') === 'true'
      const username = localStorage.getItem('username') || ''
      this.isLogin = isLogin
      this.username = username
    }
  }
})