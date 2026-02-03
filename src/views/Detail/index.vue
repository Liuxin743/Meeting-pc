<template>
  <div class="detail-view">
    <div class="page-content">
      <div class="schedule-card card-common report-card">
        <div class="card-header">
          <H3 class="card-title">个人专属日程</H3>
        </div>
        <div class="cell-group">
          <!-- 无内容提示 -->
          <div v-if="personalSchedule.length === 0" class="empty-tip">
            暂无个人专属日程，请前往「会议流程」页同步数据或收藏流程步骤
          </div>
          <div 
            class="cell-item report-item" 
            v-for="item in personalSchedule" 
            :key="`personal-${item.agendaId}-${item.stepIndex}`"
            :class="{ ended: item.isEnded }"
          >
            <div class="cell-icon">
              <span :class="getIconClass(item.icon)"></span>
              <!-- 收藏标记 -->
              <span v-if="item.isCollected" class="collect-tag">❤️</span>
            </div>
            <div class="cell-content">
              <div class="cell-title">{{ item.time }}</div>
              <div class="cell-value">{{ item.content }}</div>
              <!-- 倒计时展示 -->
              <div class="countdown-box">
                 {{ getCountdown(item.time) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 想听日程 -->
      <div class="schedule-card card-common wish-card" style="margin-top: 10px;">
        <div class="card-header">
          <h3 class="card-title">想听日程</h3>
        </div>
        <div class="cell-group">
          <!-- 无内容提示 -->
          <div v-if="wishSchedule.length === 0" class="empty-tip">
            暂无想听日程（请先收藏流程步骤）
          </div>
          <div 
            class="cell-item" 
            v-for="item in wishSchedule" 
            :key="`wish-${item.agendaId}-${item.stepIndex}`"
            :class="{ ended: item.isEnded }"
          >
            <div class="cell-icon">
              <span :class="getIconClass(item.icon)"></span>
              <span class="collect-tag">❤️</span>
            </div>
            <div class="cell-content">
              <div class="cell-title">{{ item.time }}</div>
              <div class="cell-value">{{ item.content }}</div>
              <!-- 想听日程也显示倒计时 -->
              <div class="countdown-box">
                 {{ getCountdown(item.time) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 议程编辑区域 -->
      <div class="adjust-card card-common" style="margin-top: 10px;">
        <h3 class="card-title">编辑会议议程</h3>
        <!-- 选择要编辑的议程 -->
        <div class="agenda-select">
          <select v-model="selectedAgendaId" class="select-input">
            <option value="">请选择要编辑的议程</option>
            <option v-for="agenda in agendaList" :value="agenda.id" :key="agenda.id">
              {{ agenda.title }}（{{ agenda.time }}）
            </option>
          </select>
        </div>

        <!-- 议程编辑表单 -->
        <div class="edit-form" v-if="selectedAgenda">
          <div class="form-item">
            <label class="form-label">议程标题：</label>
            <input 
              class="form-input" 
              v-model="editAgenda.title" 
              placeholder="请输入议程标题"
              autocomplete="off"
            />
          </div>
          <div class="form-item">
            <label class="form-label">议程时间：</label>
            <input 
              class="form-input" 
              type="datetime-local" 
              v-model="editAgenda.time"
            />
          </div>
          <button class="btn-primary save-btn" @click="saveAgendaEdit">
            保存修改
          </button>
        </div>
      </div>
    </div>

    <!-- 提示 -->
    <div class="toast-mask" v-if="toastVisible">
      <div class="toast-content">
        ✅ 议程修改成功，通知已更新！
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useScheduleStore } from '../../stores/scheduleStore'
import { useAgendaStore } from '../../stores/agendaStore'

const scheduleStore = useScheduleStore()
const agendaStore = useAgendaStore()
const { personalSchedule, wishSchedule } = storeToRefs(scheduleStore)
const { agendaList } = storeToRefs(agendaStore)
const { updateAgenda, loadAgendaFromLocalStorage } = agendaStore

// 页面响应式数据
const selectedAgendaId = ref('') 
const selectedAgenda = ref(null) 
const editAgenda = ref({ title: '', time: '' }) 
const toastVisible = ref(false) 
const countdownData = ref({}) 
let countdownTimer = null 
let autoClearTimer = null 

// 计算倒计时
const calculateCountdown = (timeStr) => {
  if (!timeStr) return '时间未设置'
  
  try {
    let scheduleTime
    if (timeStr.includes('T')) {
      scheduleTime = new Date(timeStr)
    } else if (timeStr.includes(' ')) {
      const [datePart, timePart] = timeStr.split(' ')
      const pureTime = timePart.includes('-') ? timePart.split('-')[0].trim() : timePart
      scheduleTime = new Date(`${datePart}T${pureTime}`)
    } else if (timeStr.includes('-')) {
      const pureTime = timeStr.split('-')[0].trim()
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      scheduleTime = new Date(`${year}-${month}-${day}T${pureTime}`)
    } else {
      scheduleTime = new Date(timeStr)
    }
    
    // 验证日期是否有效
    if (isNaN(scheduleTime.getTime())) {
      return '时间格式错误'
    }
    
    const now = new Date()
    const diff = scheduleTime - now
    
    // 已过期
    if (diff < 0) {
      return '已结束'
    }
    
    // 计算天、时、分、秒
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    // 拼接倒计时文本
    let countdownText = ''
    if (days > 0) {
      countdownText += `${days}天`
    }
    if (hours > 0 || days > 0) {
      countdownText += `${hours}时`
    }
    if (minutes > 0 || hours > 0 || days > 0) {
      countdownText += `${minutes}分`
    }
    countdownText += `${seconds}秒后开始`
    
    return countdownText
  } catch (error) {
    console.error('计算倒计时失败:', error)
    return '时间解析错误'
  }
}

// 获取倒计时
const getCountdown = (timeStr) => {
  const key = timeStr
  if (!countdownData.value[key]) {
    countdownData.value[key] = calculateCountdown(timeStr)
  }
  return countdownData.value[key]
}

// 更新所有倒计时
const updateAllCountdowns = () => {
  const newCountdownData = {}
  personalSchedule.value.forEach(item => {
    newCountdownData[item.time] = calculateCountdown(item.time)
  })
  wishSchedule.value.forEach(item => {
    newCountdownData[item.time] = calculateCountdown(item.time)
  })
  countdownData.value = newCountdownData
}

const getIconClass = (iconName) => {
  switch (iconName) {
    case 'calendar-o': return 'icon-calendar';
    case 'clock-o': return 'icon-clock';
    case 'question-o': return 'icon-question';
    default: return 'icon-default';
  }
}

const getTomorrow8AM = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(8, 0, 0, 0)
  return tomorrow.getTime()
}

// 启动自动清空定时器
const startAutoClearTimer = () => {
  const now = new Date().getTime()
  const tomorrow8AM = getTomorrow8AM()
  const delay = tomorrow8AM - now

  // 设置定时器:第二天8点清空
  autoClearTimer = setTimeout(() => {
    scheduleStore.clearEndedPersonalSchedule()
    startAutoClearTimer()
  }, delay)
}

// 保存议程修改
const saveAgendaEdit = () => {
  // 表单校验
  if (!selectedAgenda.value) {
    alert('请先选择要编辑的议程！')
    return
  }
  if (!editAgenda.value.title.trim()) {
    alert('议程标题不能为空！')
    return
  }
  if (!editAgenda.value.time) {
    alert('请选择议程时间！')
    return
  }

  // 格式化时间
  const formattedTime = editAgenda.value.time.replace('T', ' ')

  // 更新agendaStore的议程数据
  updateAgenda(selectedAgenda.value.id, {
    title: editAgenda.value.title.trim(),
    time: formattedTime
  })

  // 添加议程修改通知
  scheduleStore.addAgendaEditNotification({
    title: editAgenda.value.title.trim(),
    time: formattedTime
  })

  // 显示成功提示
  toastVisible.value = true
  setTimeout(() => {
    toastVisible.value = false
    // 重置选中状态
    selectedAgendaId.value = ''
  }, 3000)
}

// 页面挂载时加载数据
onMounted(() => {
  loadAgendaFromLocalStorage()
  updateAllCountdowns()
  countdownTimer = setInterval(updateAllCountdowns, 1000)
  startAutoClearTimer()

  watch(selectedAgendaId, (newId) => {
    selectedAgenda.value = null
    editAgenda.value = { title: '', time: '' }

    if (newId) {
      const targetAgenda = agendaList.value.find(item => item.id === newId)
      if (targetAgenda) {
        selectedAgenda.value = targetAgenda
        const formattedTime = targetAgenda.time.replace(' ', 'T')
        editAgenda.value = {
          title: targetAgenda.title,
          time: formattedTime
        }
      }
    }
  }, { immediate: false })

  // 监听日程数据变化，实时更新倒计时
  watch([personalSchedule, wishSchedule], () => {
    updateAllCountdowns()
  }, { deep: true })
})

// 页面卸载时清除定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  if (autoClearTimer) {
    clearTimeout(autoClearTimer)
    autoClearTimer = null
  }
})
</script>

<style scoped>

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box; 
}

/* 页面整体容器 */
.detail-view {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 内容外层容器*/
.page-content {
  padding: 1em;
  width: 100%; 
  margin: 0 auto;
  min-width: 320px; 
}

/* 通用卡片样式*/
.card-common {
  background-color: #fff;
  border-radius: 0.5em;
  padding: 1.2em;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  margin-bottom: 1em;
  width: 100%; 
}

.adjust-card {
  width: 100%;
  box-sizing: border-box; 
}

.card-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 1.2em;
}

.agenda-select {
  width: 100%; 
  margin-bottom: 1.5em;
  box-sizing: border-box;
}

.select-input {
  width: 100%; 
  padding: 0.8em 1em;
  border: 1px solid #ddd;
  border-radius: 0.5em;
  background-color: #fff;
  box-sizing: border-box;
  appearance: none; 
  -webkit-appearance: none;
}

/* 编辑表单容器 */
.edit-form {
  width: 100%; 
  box-sizing: border-box;
}

/* 表单项 */
.form-item {
  width: 100%; 
  margin-bottom: 1.2em;
  box-sizing: border-box;
}

/* 表单标签 */
.form-label {
  display: block;
  color: #333;
  margin-bottom: 0.6em;
}

/* 表单输入框） */
.form-input {
  width: 100%; 
  padding: 0.8em 1em;
  border: 1px solid #ddd;
  border-radius: 0.5em;
  box-sizing: border-box; 
}

/* 保存按钮 */
.save-btn {
  width: 100%; 
  padding: 0.9em 0;
  border: none;
  border-radius: 0.5em;
  background-color: #1989fa;
  color: #fff;
  cursor: pointer;
  transition: opacity 0.3s ease;
  box-sizing: border-box;
}

.save-btn:hover {
  opacity: 0.9;
}

.empty-tip {
  text-align: center;
  padding: 2em 0;
  color: #999;
  background-color: #fafafa;
  border-radius: 0.5em;
  width: 100%;
}

.cell-item {
  display: flex;
  align-items: flex-start;
  gap: 1em;
  padding: 1em;
  border-bottom: 1px solid #f0f0f0;
  width: 100%;
  flex-wrap: wrap;
}

.cell-content {
  flex: 1;
  min-width: 200px;
}

.countdown-box {
  color: #1989fa;
  margin-top: 0.5em;
}

.toast-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.toast-content {
  background-color: #fff;
  padding: 1em 2em;
  border-radius: 0.5em;
  color: #333;
}
</style>