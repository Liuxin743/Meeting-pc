<template>
  <div class="pc-layout-container">
    <!-- 左侧导航栏 -->
    <div class="left-sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <h2 class="sidebar-title" v-show="!sidebarCollapsed">会议系统</h2>
        <span class="sidebar-title-short" v-show="sidebarCollapsed"></span>
        <button class="collapse-btn" @click="toggleSidebar">
          {{ sidebarCollapsed ? '▶' : '◀' }}
        </button>
      </div>
      <div class="sidebar-menu">
        <div
          class="menu-item"
          v-for="menu in menuList"
          :key="menu.path"
          :class="{ active: currentPath === menu.path }"
          @click="handleMenuClick(menu.path)"
        >
          <van-icon :name="menu.icon" class="menu-icon" />
          <span class="menu-text" v-show="!sidebarCollapsed">{{ menu.title }}</span>
        </div>
      </div>
    </div>

    <!-- 右侧主体内容区（移除硬编码 :style） -->
    <div class="right-content">
      <!-- 顶部用户信息区（修复 padding 异常） -->
      <div class="top-user-info">
        <div class="user-avatar" @click="openUserEditDialog">
          <van-icon v-if="!userAvatar" name="user" size="30" color="#1989fa" />
          <img v-else class="avatar-img" :src="userAvatar" alt="用户头像" />
        </div>
        <div class="user-name">{{ userName }}</div>
      </div>

      <!-- 页面内容容器（优化滚动） -->
      <div class="content-container">
        <router-view />
      </div>
    </div>

    <!-- 个人信息编辑弹窗（简化宽度配置） -->
    <van-dialog
      v-model:show="userEditDialogVisible"
      title="编辑个人信息"
      confirm-button-text="保存"
      cancel-button-text="取消"
      @confirm="saveUserInfo"
      @cancel="resetUploader"
    >
      <div class="user-edit-content">
        <div class="edit-item">
          <label class="edit-label">头像：</label>
          <div class="avatar-upload">
            <div class="preview-avatar">
              <van-icon v-if="!tempAvatar && !userAvatar" name="user" size="25" color="#1989fa" />
              <img v-else class="preview-img" :src="tempAvatar || userAvatar" alt="预览头像" />
            </div>
            <van-uploader
              v-model="uploaderFiles"
              accept="image/*"
              max-count="1"
              :preview-size="0"
              :after-read="handleAfterRead"
              :before-delete="handleBeforeDelete"
              class="avatar-uploader"
            >
              <button class="upload-btn van-button van-button--primary van-button--mini">
                选择图片
              </button>
            </van-uploader>
            <div class="upload-tip">支持 JPG、PNG 格式，大小不超过 2MB</div>
          </div>
        </div>
        <div class="edit-item">
          <label class="edit-label">用户名：</label>
          <van-field
            v-model="tempUserName"
            placeholder="输入你的用户名"
            required
            class="name-input"
          />
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAgendaStore } from '../stores/agendaStore'

const router = useRouter()
const route = useRoute()
// 兼容无 agendaStore 场景，避免报错
const agendaStore = useAgendaStore?.() || { clearAgendaStorage: () => {} }

// 左侧导航折叠状态
const sidebarCollapsed = ref(false)
const currentPath = ref(route.path)

const userName = ref('会议参与者') // 默认值
const userAvatar = ref('')

// 弹窗相关
const userEditDialogVisible = ref(false)
const tempUserName = ref('')
const tempAvatar = ref('')
const uploaderFiles = ref([])

// 保存到本地缓存
const saveToLocalStorage = () => {
  localStorage.setItem('userName', userName.value)
  localStorage.setItem('userAvatar', userAvatar.value)
}

// 头像上传回调
const handleAfterRead = (file) => {
  if (file.size > 2 * 1024 * 1024) {
    alert('图片大小不能超过 2MB，请选择更小的图片！')
    uploaderFiles.value = []
    return
  }
  tempAvatar.value = file.content
  uploaderFiles.value = [file]
}

// 移除头像回调
const handleBeforeDelete = () => {
  tempAvatar.value = ''
  uploaderFiles.value = []
  return true
}

// 重置上传器
const resetUploader = () => {
  tempAvatar.value = ''
  tempUserName.value = userName.value
  uploaderFiles.value = []
}

// 打开编辑弹窗
const openUserEditDialog = () => {
  tempUserName.value = userName.value
  tempAvatar.value = userAvatar.value
  uploaderFiles.value = []
  userEditDialogVisible.value = true
}
provide('openUserEditDialog', openUserEditDialog)

// 保存个人信息
const saveUserInfo = () => {
  if (!tempUserName.value.trim()) {
    alert('用户名不能为空，请输入有效名称！')
    return
  }
  // 更新正式数据
  userName.value = tempUserName.value.trim()
  if (tempAvatar.value) {
    userAvatar.value = tempAvatar.value
  }
  // 保存到本地缓存
  saveToLocalStorage()
  // 关闭弹窗 + 重置上传器
  userEditDialogVisible.value = false
  resetUploader()
  alert('个人信息保存成功！')
}

// 导航菜单列表
const menuList = ref([
  { path: '/home', title: '首页', icon: 'home-o' },
  { path: '/process', title: '会议流程', icon: 'label-o' },
  { path: '/detail', title: '收藏议程', icon: 'info-o' },
  { path: '/create-meeting', title: '创建会议', icon: 'comment-circle-o' },
  { path: '/mine', title: '编辑', icon: 'user-o' },
  { path: '/logout', title: '退出登录', icon: 'warning-o' } // 新增：退出登录菜单
])

const currentMenuTitle = computed(() => {
  const currentMenu = menuList.value.find(item => item.path === currentPath.value)
  return currentMenu ? currentMenu.title : '会议管理系统'
})

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const handleMenuClick = (path) => {
  // 判断是否是退出登录
  if (path === '/logout') {
    handleLogout()
    return
  }
  currentPath.value = path
  router.push(path)
}

const handleLogout = () => {
  if (!confirm('确定要退出登录吗？')) {
    return
  }

  // 清除本地缓存
  localStorage.removeItem('userName')
  localStorage.removeItem('userAvatar')
  localStorage.removeItem('rememberedUsername')
  localStorage.removeItem('rememberedPwd')
  localStorage.removeItem('token')

  // 重置用户信息
  userName.value = '会议参与者'
  userAvatar.value = ''
  
  // 跳转到登录页
  router.push('/login')
  alert('已成功退出登录！')
}

const refreshPage = () => {
  window.location.reload()
}

const clearLocalCache = () => {
  if (confirm('确定要清除所有缓存吗？清除后数据将无法恢复')) {
    agendaStore.clearAgendaStorage()
    localStorage.clear()
    // 重置用户信息
    userName.value = '会议参与者'
    userAvatar.value = ''
    alert('缓存已清除，页面即将刷新')
    setTimeout(() => refreshPage(), 1000)
  }
}

onMounted(() => {
  // 从本地缓存加载用户信息
  const savedName = localStorage.getItem('userName')
  const savedAvatar = localStorage.getItem('userAvatar')
  
  if (savedName) {
    userName.value = savedName
  }
  if (savedAvatar) {
    userAvatar.value = savedAvatar
  }

  // 监听路由变化，更新当前选中菜单
  watch(
    () => route.path,
    (newPath) => {
      currentPath.value = newPath
    },
    { immediate: true }
  )

  // 监听用户信息变化，自动保存到本地缓存
  watch([userName, userAvatar], () => {
    saveToLocalStorage()
  }, { deep: true })
})
</script>

<style scoped>
/* 整体布局 */
.pc-layout-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--light-gray-color);
}

/* 左侧导航栏 */
.left-sidebar {
  width: 200px;
  height: 100vh;
  background-color: #13171b;
  color: #fff;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  transition: width 0.3s ease;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.left-sidebar.collapsed {
  width: 80px; 
}

.sidebar-header {
  height: 60px; /* 统一高度，与用户信息区对齐 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #1f2d3d;
  background-color: #13171b;
}

.sidebar-title {
  font-weight: bold;
  font-size: 18px;
}

.collapse-btn {
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  transition: transform 0.3s ease;
  font-size: 16px;
}

.collapse-btn:hover {
  transform: scale(1.1);
}

.sidebar-menu {
  padding-top: 20px; /* 菜单顶部合理间距 */
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  color: #a7b1c2;
  transition: all 0.3s ease;
  margin: 0 8px 8px; /* 菜单项之间底部间距，移除不合理的 margin-top */
  border-radius: 6px;
}

.menu-item.active {
  background-color: #1d99af;
  color: #fff;
}

.menu-item:hover:not(.active) {
  background-color: #1f2d3d;
  color: #fff;
}

/* 退出登录菜单特殊样式 */
.menu-item:has(.menu-text:contains("退出登录")) {
  color: #ff4d4f;
}

.menu-item:has(.menu-text:contains("退出登录")).active {
  background-color: #ff4d4f;
  color: #fff;
}

.menu-item:has(.menu-text:contains("退出登录")):hover:not(.active) {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.menu-icon {
  font-size: 20px;
  width: 24px;
  text-align: center;
}

.menu-text {
  margin-left: 12px;
  transition: opacity 0.3s ease;
  font-size: 14px;
}

/* 右侧内容区 */
.right-content {
  flex: 1;
  margin-left: 200px; /* 与侧边栏宽度一致 */
  transition: margin-left 0.3s ease;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

/* 侧边栏折叠时，右侧内容区 margin-left 同步变化 */
.left-sidebar.collapsed + .right-content {
  margin-left: 80px;
}

/* 顶部用户信息 */
.top-user-info {
  height: 60px;
  width: 120px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 10px; 
  background-color: transparent;
  border-bottom: none;
  margin:0  auto;
  margin-right: 10px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f5fafe;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1989fa;
  overflow: hidden;
  cursor: pointer;
  margin-right: 12px;
  border: 2px solid #1989fa;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  color: #333;
  font-weight: 500;
  font-size: 16px;
}

/* 右侧内容容器（优化滚动，避免内容截断） */
.content-container {
  width: 100%;
  overflow-y: auto; /* 内容超出时可滚动 */
  box-sizing: border-box;
  padding: 20px;
  max-width: var(--content-max-width);
}

/* 个人信息弹窗 */
.user-edit-content {
  padding: 0.6em 0;
}

.edit-item {
  margin-bottom: 1em;
}

.edit-label {
  color: #333;
  margin-bottom: 0.5em;
  display: block;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.preview-avatar {
  width: 150px; 
  height: 150px;
  border-radius: 50%;
  background-color: #f5fafe;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 0.5em;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-btn {
  padding: 0.4em 1.2em; 
}

.upload-tip {
  color: #999;
  margin-top: 0.3em;
  font-size: 12px;
}

.name-input {
  margin-top: 0.3em;
}

/* 弹窗样式优化，避免冗余覆盖 */
:global(.van-dialog) {
  max-width: 600px;
  width: 80%;
}

:global(.van-dialog__header) {
  padding: 0.8em 0;
}
</style>