<template>
  <div class="setting-page">
    <div class="page-header">
      <van-icon 
        name="arrow-left" 
        size="20" 
        color="#1989fa" 
        class="back-icon" 
        @click="goBack"
      />
      <div class="page-title">系统设置</div>
    </div>

    <!-- 内容区域 -->
    <div class="page-content">
      <div class="setting-card card-common">
        <!-- 通用设置项 -->
        <div class="setting-item">
          <div class="setting-label">清除缓存</div>
          <button class="btn-normal mini-btn" @click="clearCache">一键清除</button>
        </div>
        <div class="setting-item">
          <div class="setting-label">消息通知</div>
          <van-switch v-model="notificationSwitch" color="#1989fa" />
        </div>
        <div class="setting-item">
          <div class="setting-label">关于我们</div>
          <van-icon name="arrow-right" size="16" color="#c8c9cc" @click="goToAbout" />
        </div>
        <div class="setting-item">
          <div class="setting-label">版本信息</div>
          <div class="version-text">v1.0.0</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted,watch} from 'vue'
import { useRouter } from 'vue-router'
import { useAgendaStore } from '../stores/agendaStore'

const router = useRouter()

// 用于清除缓存
const agendaStore = useAgendaStore()

// 消息通知开关状态
const notificationSwitch = ref(true)
onMounted(() => {
  const savedSwitch = localStorage.getItem('notificationSwitch')
  if (savedSwitch !== null) {
    notificationSwitch.value = savedSwitch === 'true'
  }
})

const goBack = () => {
  router.push({ path: '/mine' }) 
}

// 清除缓存
const clearCache = () => {
  agendaStore.clearAgendaStorage()
  localStorage.removeItem('userName')
  localStorage.removeItem('userAvatar')
  localStorage.removeItem('notificationSwitch')
  alert('缓存已清除完成！')
}

const goToAbout = () => {
  alert('关于我们：会议管理系统 v1.0.0，专注于高效会议议程管理')
}

watch(notificationSwitch, (newValue) => {
  localStorage.setItem('notificationSwitch', newValue)
})
</script>

<style scoped>
/* 整体样式 */
.setting-page {
  min-height: 100vh;
  background-color: #f5f5f5;

}

.page-header {
  display: flex;
  align-items: center;
  position: relative;

  font-weight: bold;
  color: #333;
  padding: 0.8em 1em; 
  background-color: #ffffff;
  border-bottom: 1px solid #f0f0f0; 
  width: 100%; 
  box-sizing: border-box; 
}

/* 返回图标 */
.back-icon {
  cursor: pointer;
  margin-right: 0.75em;

}

/* 标题 */
.page-title {
  flex: 1;
  text-align: center;
  margin-right: 1.25em;

}

/* 内容*/
.page-content {
  padding: 0.8em 1.2em; 
  width: 100%; 
  box-sizing: border-box; 
  margin: 0 auto;
  min-width: 320px; 
}

/* 通用卡片 */
.card-common {
  background-color: #ffffff;
  border-radius: 0.5em;
  padding: 1em; 
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); 
  margin-bottom: 0.8em; 
  width: 100%; 
  box-sizing: border-box; 
}

/* 系统设置项 */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8em 0; 
  border-bottom: 1px solid #f0f0f0;

  width: 100%; 
  box-sizing: border-box; 
  flex-wrap: wrap;
  gap: 0.5em; 
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  color: #333;
  flex-shrink: 0; 
}

.version-text {
  color: #666;
}

/* 按钮样式 */
.btn-normal {
  background-color: #e6f7ff;
  color: #1989fa;
  border: none;
  border-radius: 0.25em;
  cursor: pointer;
  transition: background-color 0.3s ease;

}

.btn-normal:hover {
  background-color: #d1eaff;
}

.mini-btn {
  padding: 0.25em 0.5em; 
}

.van-switch {
  transform: scale(1.2); 
  flex-shrink: 0;
}
</style>