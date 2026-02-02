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

    <!-- 右侧主体内容区 -->
    <div class="right-content" :style="{ marginLeft: sidebarCollapsed ? '200px' : '650px' }">
      <!-- 顶部用户信息区（显示注册/登录的用户名） -->
      <div class="top-user-info">
        <div class="user-avatar" @click="openUserEditDialog">
          <van-icon v-if="!userAvatar" name="user" size="30" color="#1989fa" />
          <img v-else class="avatar-img" :src="userAvatar" alt="用户头像" />
        </div>
        <div class="user-name">{{ userName }}</div>
      </div>

      <!-- 页面内容容器 -->
      <div class="content-container">
        <router-view />
      </div>
    </div>

    <!-- 个人信息编辑弹窗 -->
    <van-dialog
      v-model:show="userEditDialogVisible"
      title="编辑个人信息"
      width="40%"
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
const agendaStore = useAgendaStore() || { clearAgendaStorage: () => {} } // 兼容无 agendaStore 场景

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

  localStorage.removeItem('userName')
  localStorage.removeItem('userAvatar')
  localStorage.removeItem('rememberedUsername')
  localStorage.removeItem('rememberedPwd')
  localStorage.removeItem('token')

  userName.value = '会议参与者'
  userAvatar.value = ''
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
  const savedName = localStorage.getItem('userName')
  const savedAvatar = localStorage.getItem('userAvatar')
  
  if (savedName) {
    userName.value = savedName
  } else {
    userName.value = '会议参与者'
  }
  
  if (savedAvatar) {
    userAvatar.value = savedAvatar
  }

  watch(
    () => route.path,
    (newPath) => {
      currentPath.value = newPath
    },
    { immediate: true }
  )

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
  background-color: #f5f7fa;
}

/* 左侧导航栏 */
.left-sidebar {
  width: 600px;
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
  width: 150px;
}

.sidebar-header {
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  border-bottom: 1px solid #13171b;
  background-color: #13171b;
}

.sidebar-title {
  font-size: 4em;
  font-weight: bold;
  margin: 100px 50px 0 50px;
}

.collapse-btn {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 3em;
  cursor: pointer;
  transition: transform 0.3s ease;
  margin: 100px 50px 0 50px;
}

.collapse-btn:hover {
  transform: scale(1.1);
}

.sidebar-menu {
  padding-top: 20px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  color: #a7b1c2;
  transition: all 0.3s ease;
  margin: 0 5px;
  border-radius: 4px;
  margin-top: 100px;
}

.menu-item.active {
  background-color: #1d99af;
  color: #fff;
}

.menu-item:hover:not(.active) {
  background-color: #1f2d3d;
  color: #fff;
}

.menu-item[title="退出登录"] {
  color: #ff4d4f;
}

.menu-item[title="退出登录"].active {
  background-color: #ff4d4f;
  color: #fff;
}

.menu-item[title="退出登录"]:hover:not(.active) {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.menu-icon {
  font-size: 4em;
  margin: 0 10px;
  width: 50px;
  text-align: center;
}

.menu-text {
  font-size: 4em;
  margin-left: 40px;
  transition: opacity 0.3s ease;
}

/* 右侧内容区 */
.right-content {
  flex: 1;
  margin-left: 300px;
  transition: margin-left 0.3s ease;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.left-sidebar.collapsed + .right-content {
  margin-left: 100px;
}

/* 顶部用户信息 */
.top-user-info {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 100px;
  margin-top: 40px;
  background-color: transparent;
  border-bottom: none;
}

.user-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: #f5fafe;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1989fa;
  font-size: 2em;
  overflow: hidden;
  cursor: pointer;
  margin-right: 10px;
  border: 2px solid #1989fa;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: 3em;
  color: #333;
  font-weight: 500;
}

/* 右侧内容容器 */
.content-container {
  width: 100%;
  height: calc(100% - 80px);
  overflow-y: auto;
  box-sizing: border-box;
  padding: 10px;
}

/* 个人信息弹窗 */
.user-edit-content {
  padding: 0.6em 0;
  font-size: 2em; 
}

.edit-item {
  margin-bottom: 1em;
}

.edit-label {
  font-size: 2em; 
  color: #333;
  margin-bottom: 0.5em;
  display: block;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  font-size: 1.2em; 
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

.upload-btn {
  font-size: 1.2em; 
  padding: 0.4em 1.2em; 
}

.upload-tip {
  font-size: 1.1em; 
  color: #999;
  margin-top: 0.3em;
}

.name-input {
  margin-top: 0.3em;
  font-size: 1.2em; 
}

:global(.van-dialog__header) {
  font-size: 4em !important;
  padding: 0.8em 0;
}

:global(.van-button__content) {
  font-size: 2.5em !important; 
}
</style>