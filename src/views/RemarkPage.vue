<template>
  <div class="remark-page">
    <!-- 页面头部-->
    <div class="page-header">
      <van-icon 
        name="arrow-left" 
        size="20" 
        color="#1989fa" 
        class="back-icon" 
        @click="goBack"
      />
      <div class="page-title">我的备注</div>
    </div>

    <div class="page-content">
      <div class="remark-card card-common">
        <div class="empty-tip" v-if="remarkAgendas.length === 0">
          暂无备注的议程
        </div>
        <div class="remark-list" v-else>
          <div class="remark-item" v-for="agenda in remarkAgendas" :key="agenda.id">
            <div class="remark-header">
              <div class="remark-title">{{ agenda.title }}</div>
              <div class="remark-time">{{ agenda.time }}</div>
            </div>
            <div class="remark-content" v-html="agenda.remark"></div>
            <div class="remark-actions">
              <button class="btn-normal mini-btn" @click="goToEditRemark(agenda)">
                修改
              </button>
              <button class="btn-danger mini-btn" @click="deleteRemark(agenda.id)">
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAgendaStore } from '../stores/agendaStore'
import { Icon } from 'vant'

const router = useRouter()
const agendaStore = useAgendaStore()
// 存储所有带备注的议程
const remarkAgendas = ref([])

// 刷新备注列表
const refreshRemarkList = () => {
  remarkAgendas.value = agendaStore.getRemarkAgendas() || []
}

// 页面挂载时初始化数据
onMounted(() => {
  // 加载本地持久化数据
  agendaStore.loadAgendaFromLocalStorage()
  // 刷新备注列表
  refreshRemarkList()
})

// 跳转到会议流程页面修改备注
const goToEditRemark = (agenda) => {
  router.push({
    path: '/process', 
    query: { editRemarkId: agenda.id } // 传递要修改的议程ID
  })
}

// 删除备注
const deleteRemark = (agendaId) => {
  agendaStore.saveAgendaRemark(agendaId, '')
  refreshRemarkList()
  alert('备注已删除')
}

const goBack = () => {
  router.push({ 
    path: '/mine' 
  })
}
</script>

<style scoped>

/* 整体样式 */
.remark-page {
  min-height: 100vh;
  background-color: #f5f5f5;
 }

/* 头部 */
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

/* 内容区域 */
.page-content {
  padding: 0.8em 1.2em; 
  width: 100%;
  max-width: 1200px; 
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

/* 空数据提示 */
.empty-tip {
 
  color: #999;
  text-align: center;
  padding: 1.5em 0; 
  width: 100%; 
  box-sizing: border-box;
}

/* 备注列表 */
.remark-item {
  padding: 0.8em 0; 
  border-bottom: 1px solid #f0f0f0; 
  width: 100%;
  box-sizing: border-box;
}

.remark-item:last-child {
  border-bottom: none;
}

.remark-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5em;
  flex-wrap: wrap; 
  gap: 0.5em; 
}

.remark-title {

  font-weight: 500;
  color: #333;
  flex-shrink: 0; 
}

.remark-time {
 
  color: #666;
  background-color: #f5fafe;
  padding: 0.125em 0.375em;
  border-radius: 0.25em;
  flex-shrink: 0; 
}

.remark-content {

  color: #333;
  line-height: 1.6;
  padding: 0.5em;
  background-color: #f9f9f9;
  border-radius: 0.25em;
  margin-bottom: 0.5em;
  min-height: 2.5em;
  width: 100%; 
  box-sizing: border-box; 
}

/* 备注操作按钮组 */
.remark-actions {
  display: flex;
  gap: 0.5em; 
  justify-content: flex-start;
  flex-wrap: wrap; 
}

.btn-normal {
  background-color: #e6f7ff;
  color: #1989fa;
  border: none;
  border-radius: 0.25em;
  padding: 0.25em 0.5em;
  
  cursor: pointer;
  transition: background-color 0.3s ease;
  flex-shrink: 0; 
}

.btn-normal:hover {
  background-color: #d1eaff;
}

.btn-danger {
  background-color: #ff4d4f;
  color: #ffffff;
  border: none;
  border-radius: 0.25em;
  padding: 0.25em 0.5em;
 
  cursor: pointer;
  transition: background-color 0.3s ease;
  flex-shrink: 0; 
}

.btn-danger:hover {
  background-color: #ff3333;
}

.mini-btn {
  padding: 0.25em 0.5em;
 
}
</style>