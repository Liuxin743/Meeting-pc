<template>
  <div class="home-page">
    <div class="home-scroll-content">
      <div class="page-content">
        <!-- 会议状态卡片 -->
        <el-card class="mb-4" shadow="hover">
          <template #header>
            <h3 class="card-title">会议状态</h3>
          </template>
          <div class="upcoming-container">
            <div class="empty-tip" v-if="meetingStatusAgendas.length === 0 && !loading">
              暂无相关会议议程
            </div>
            <div
              class="upcoming-item"
              v-for="agenda in meetingStatusAgendas"
              :key="agenda.id"
              :class="{
                'status-ongoing': agenda.meetingStatus === 'ongoing',
                'status-upcoming': agenda.meetingStatus === 'upcoming',
                'status-ended': agenda.meetingStatus === 'ended'
              }"
            >
              <div class="upcoming-header">
                <div class="upcoming-title">{{ agenda.title }}</div>
                <div class="upcoming-status-tag">
                  {{ 
                    agenda.meetingStatus === 'ongoing' ? '正在进行' : 
                    agenda.meetingStatus === 'upcoming' ? '即将开始' : '已结束' 
                  }}
                </div>
              </div>
              <div class="upcoming-time">会议时间：{{ agenda.time }}</div>
              <div class="upcoming-tags" v-if="agenda.tags.length > 0">
                <span class="tag-item" v-for="tag in agenda.tags" :key="tag">{{ tag }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 重要通知卡片 -->
        <el-card class="mb-4" shadow="hover">
          <template #header>
            <h3 class="card-title">重要通知</h3>
          </template>
          <div class="notice-container">
            <div class="notice-empty" v-if="notifications.length === 0">
              暂无未处理通知，敬请关注
            </div>
            <div class="notice-item" v-for="(item, index) in notifications" :key="item.id">
              <div class="notice-header">
                <span class="notice-type">{{ item.type }}</span>
                <span class="notice-status" :class="item.status">{{ item.status }}</span>
              </div>
              <div class="notice-content">
                <p class="notice-title">{{ item.title }}</p>
                <p class="notice-desc">{{ item.content }}</p>
                <p class="notice-time">创建时间：{{ item.createTime }}</p>
              </div>
              <div class="notice-divider" v-if="index < notifications.length - 1"></div>
            </div>
          </div>
        </el-card>

        <!-- 加载/错误提示 -->
        <div class="loading-mask" v-if="loading">
          <div class="loading-content">加载中...</div>
        </div>
        <div class="error-bar" v-if="errorMsg" @click="clearErrorMsg">
          ❌ {{ errorMsg }} <span class="error-close">×</span>
        </div>

        <!-- 议程列表 -->
        <div class="agenda-list">
          <div class="empty-tip" v-if="agendaList.length === 0 && !loading">
            暂无会议议程，前往「我的」页面创建吧~
          </div>
          <div
            class="agenda-item card-common"
            v-for="(agenda, index) in agendaList"
            :key="agenda.id"
          >
            <div class="agenda-header">
              <div class="agenda-title" @click="openEditDialog(agenda)">
                {{ agenda.title }}
              </div>
              <div class="agenda-time">
                {{ agenda.time }}
              </div>
            </div>

            <div class="agenda-actions">
              <button class="btn-normal mini-btn" @click="openTagDialog(agenda)">
                标签
              </button>
              <button
                class="btn-normal mini-btn"
                @click="openRemarkDialog(agenda)"
              >
                备注
              </button>
              <button
                class="btn-normal mini-btn"
                :class="{ collected: agenda.isCollected }"
                @click="handleToggleCollect(agenda.id)"
              >
                {{ agenda.isCollected ? "已收藏" : "收藏" }}
              </button>
              <button
                class="btn-normal mini-btn"
                @click="openShareDialog(agenda)"
              >
                分享
              </button>
              <!-- 会议提醒按钮 -->
              <button
                class="btn-normal mini-btn"
                style="background-color: #f0fff4; color: #52c41a;"
                @click="setBrowserReminder(agenda)"
              >
                设置提醒
              </button>
              <button
                class="btn-normal mini-btn"
                style="background-color: #fff7e6; color: #fa8c16;"
                @click="addToMobileCalendar(agenda)"
              >
                添加到日历
              </button>
              <button
                class="btn-danger mini-btn"
                @click="handleDeleteAgenda(agenda.id)"
              >
                删除
              </button>
            </div>

            <div class="agenda-tags" v-if="agenda.tags.length > 0">
              <span class="tag-item" v-for="tag in agenda.tags" :key="tag">{{ tag }}</span>
            </div>

            <div class="agenda-remark" v-if="agenda.remark">
              <div class="remark-label">备注：</div>
              <div class="remark-content" v-html="agenda.remark"></div>
              <div class="remark-actions">
                <button class="btn-normal mini-btn remark-edit" @click="openRemarkDialog(agenda)">
                  修改
                </button>
                <button class="btn-danger mini-btn remark-delete" @click="deleteAgendaRemark(agenda.id)">
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑议程弹窗 -->
    <div
      class="dialog-mask"
      v-if="editDialogVisible"
      @click="editDialogVisible = false"
    >
      <div class="dialog-content" @click.stop>
        <h3 class="dialog-title">编辑议程</h3>
        <div class="form-item">
          <label class="form-label">议程标题：</label>
          <input
            class="form-input"
            v-model="editAgenda.title"
            placeholder="请输入议程标题"
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
        <div class="dialog-btn-group">
          <button
            class="dialog-cancel-btn"
            @click="editDialogVisible = false"
          >
            取消
          </button>
          <button class="dialog-confirm-btn" @click="handleEditAgenda">
            确认修改
          </button>
        </div>
      </div>
    </div>

    <!-- 标签选择弹窗 -->
    <div
      class="dialog-mask"
      v-if="tagDialogVisible"
      @click="tagDialogVisible = false"
    >
      <div class="dialog-content" @click.stop>
        <h3 class="dialog-title">选择标签</h3>
        <div class="tag-group">
          <div
            class="tag-option"
            v-for="tag in allTags"
            :key="tag"
            :class="{ selected: currentAgendaTags.includes(tag) }"
            @click="toggleTag(tag)"
          >
            {{ tag }}
          </div>
        </div>
        <button class="dialog-confirm-btn" @click="saveTags">确认保存</button>
      </div>
    </div>

    <!-- 备注弹窗 -->
    <div
      class="dialog-mask"
      v-if="remarkDialogVisible"
      @click="remarkDialogVisible = false"
    >
      <div class="dialog-content dialog-lg" @click.stop>
        <h3 class="dialog-title">添加/编辑备注</h3>
        <textarea
          class="remark-input"
          v-model="currentRemark"
          placeholder="请输入该议程的备注信息（支持简单HTML格式，如&lt;br/&gt;换行）"
          rows="8"
        ></textarea>
        <div class="dialog-btn-group">
          <button
            class="dialog-cancel-btn"
            @click="remarkDialogVisible = false"
          >
            取消
          </button>
          <button class="dialog-confirm-btn" @click="saveRemark">确认</button>
        </div>
      </div>
    </div>

    <!-- 分享弹窗 -->
    <div
      class="dialog-mask"
      v-if="shareDialogVisible"
      @click="shareDialogVisible = false"
    >
      <div class="dialog-content" @click.stop>
        <h3 class="dialog-title">分享该议程</h3>
        <div class="share-content">
          <div class="share-tips">复制下方链接分享给他人</div>
          <div class="share-link">{{ currentShareLink }}</div>
          <button class="btn-primary mini-btn" @click="copyLink">
            复制链接
          </button>
        </div>
        <button
          class="dialog-confirm-btn"
          @click="shareDialogVisible = false"
          style="margin-top: 1em"
        >
          关闭
        </button>
      </div>
    </div>

    <!-- 操作提示-->
    <div class="toast-mask" v-if="toastVisible">
      <div class="toast-content">
        {{ toastText }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAgendaStore } from '../../stores/agendaStore'
import { useScheduleStore } from '../../stores/scheduleStore'

// 初始化Pinia仓库
const agendaStore = useAgendaStore()
const scheduleStore = useScheduleStore()

// 解构仓库响应式数据
const { agendaList } = storeToRefs(agendaStore)
const { notifications } = storeToRefs(scheduleStore)

// 初始化路由
const router = useRouter()

const loading = ref(false)
const errorMsg = ref("")
const toastVisible = ref(false)
const toastText = ref("")

const allTags = ref(["重点", "待讨论", "已完成", "延期", "需汇报"])
const tagDialogVisible = ref(false)
const currentAgendaId = ref(null)
const currentAgendaTags = ref([])

const remarkDialogVisible = ref(false)
const currentRemark = ref("")

const shareDialogVisible = ref(false)
const currentShareLink = ref("")

const editDialogVisible = ref(false)
const editAgenda = ref({
  id: null,
  title: "",
  time: ""
})

const reminderTimers = ref([])

// 配置常量
const CLEAN_HOUR = 8 // 次日早上清理时间（默认8:00）
const UPCOMING_RANGE = 2 * 60 * 60 * 1000 // 即将开始：2小时内
const ENDED_RANGE = 1 * 60 * 60 * 1000 // 正在进行：会议开始后1小时内
let dailyCleanTimer = null // 每日清理定时器

// 格式化日期（获取年月日）
const formatDate = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

// 判断是否为前一天的日期
const isYesterday = (agendaTime) => {
  const today = new Date()
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
  const agendaDate = new Date(agendaTime.replace(' ', 'T'))

  // 比较年月日
  const agendaDateStamp = formatDate(agendaDate)
  const yesterdayStamp = formatDate(yesterday)
  const todayStamp = formatDate(today)

  // 前一天日期 && 早于当天0点（已结束）
  return agendaDateStamp === yesterdayStamp && agendaDateStamp < todayStamp
}

// 筛选会议状态：即将开始/正在进行/已结束
const meetingStatusAgendas = computed(() => {
  if (!agendaList.value || agendaList.value.length === 0) return []

  const now = new Date()
  const todayStamp = formatDate(now)

  return agendaList.value
    .map(agenda => {
      // 解析议程时间
      const agendaTimeStr = agenda.time.replace(' ', 'T')
      const agendaDate = new Date(agendaTimeStr)
      const timeDiff = agendaDate.getTime() - now.getTime()
      const agendaDateStamp = formatDate(agendaDate)

      // 标记状态
      let meetingStatus = ''
      if (agendaDateStamp >= todayStamp) { // 当天及未来的会议
        if (timeDiff > 0 && timeDiff <= UPCOMING_RANGE) {
          meetingStatus = 'upcoming' // 即将开始（绿色）
        } else if (timeDiff <= 0 && timeDiff >= -ENDED_RANGE) {
          meetingStatus = 'ongoing' // 正在进行（橙色）
        } else if (timeDiff < -ENDED_RANGE) {
          meetingStatus = 'ended' // 当天已结束（灰色）
        }
      } else if (agendaDateStamp === formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1))) {
        // 前一天的会议（保留，待次日早上清理）
        meetingStatus = 'ended' // 已结束（灰色）
      }

      return {
        ...agenda,
        meetingStatus
      }
    })
    .filter(agenda => agenda.meetingStatus) // 只保留有状态的议程
    .sort((a, b) => {
      // 优先级：正在进行 > 即将开始 > 已结束
      const statusOrder = { ongoing: 0, upcoming: 1, ended: 2 }
      if (a.meetingStatus !== b.meetingStatus) {
        return statusOrder[a.meetingStatus] - statusOrder[b.meetingStatus]
      }
      // 同状态按会议时间升序排列（自动叠加）
      const aTime = new Date(a.time.replace(' ', 'T')).getTime()
      const bTime = new Date(b.time.replace(' ', 'T')).getTime()
      return aTime - bTime
    })
})

// 会议状态列表实时刷新
watch(agendaList, () => {})

// 格式化当前时间
const formatCurrentDateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hour}:${minute}`
}

// 验证日期是否为未来日期（用于提醒功能）
const isFutureDate = (date) => {
  if (!(date instanceof Date)) return false
  const now = new Date()
  return date.getTime() > now.getTime()
}

// 格式化日历日期（符合iCal标准，用于手机日历导入）
const formatCalendarDate = (date) => {
  if (!(date instanceof Date)) return ''
  return date.toISOString()
    .replace(/-/g, '')
    .replace(/:/g, '')
    .replace(/\.\d{3}Z/, 'Z')
}

// 格式化时间显示
const formatLocaleTime = (date) => {
  if (!(date instanceof Date)) return ''
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 清理前一天已结束的会议
const clearYesterdayAgendas = () => {
  if (!agendaList.value || agendaList.value.length === 0) return

  // 筛选出「非前一天」的议程
  const validAgendas = agendaList.value.filter(agenda => {
    return !isYesterday(agenda.time)
  })

  // 计算清理数量
  const deletedCount = agendaList.value.length - validAgendas.length
  if (deletedCount > 0) {
    console.log(`[每日自动清理] 已清空${deletedCount}条前一天已结束的会议`)
    // 开启用户提示
    showToast(`已自动清理${deletedCount}条前一天已结束的会议`)
  }

  // 更新Pinia仓库和本地存储，保证数据持久化
  agendaStore.agendaList = validAgendas
  localStorage.setItem('agendaList', JSON.stringify(validAgendas))
}

// 计算距离次日清理时间的毫秒数
const getTimeToNextClean = () => {
  const now = new Date()
  // 次日清理时间
  const nextClean = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    CLEAN_HOUR,
    0,
    0,
    0
  )
  return nextClean.getTime() - now.getTime()
}

// 启动每日定时清理任务
const startDailyCleanTask = () => {
  if (dailyCleanTimer) clearTimeout(dailyCleanTimer)
  const timeToNextClean = getTimeToNextClean()
  dailyCleanTimer = setTimeout(() => {
    clearYesterdayAgendas()
    startDailyCleanTask()
  }, timeToNextClean)
}

onMounted(() => {
  loading.value = true
  try {
    agendaStore.loadAgendaFromLocalStorage()
    const now = new Date()
    const todayClean = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      CLEAN_HOUR,
      0,
      0,
      0
    )

    if (now.getTime() > todayClean.getTime()) {
      clearYesterdayAgendas()
    }

    // 启动每日定时清理任务
    startDailyCleanTask()
  } catch (err) {
    errorMsg.value = "数据加载失败，请刷新页面"
    console.error("数据加载异常：", err)
  } finally {
    loading.value = false
  }
})

// 页面卸载时：清除所有定时器
onUnmounted(() => {
  reminderTimers.value.forEach(item => {
    clearTimeout(item.timer)
  })

  // 清除每日清理定时器
  if (dailyCleanTimer) {
    clearTimeout(dailyCleanTimer)
    dailyCleanTimer = null
  }
})

// 提示方法
const showToast = (text) => {
  toastText.value = text
  toastVisible.value = true
  setTimeout(() => {
    toastVisible.value = false
  }, 2000)
}

// 清除错误提示条
const clearErrorMsg = () => {
  errorMsg.value = ""
}

// 打开标签选择弹窗
const openTagDialog = (agenda) => {
  currentAgendaId.value = agenda.id
  currentAgendaTags.value = [...agenda.tags]
  tagDialogVisible.value = true
}

// 切换标签选中状态
const toggleTag = (tag) => {
  const index = currentAgendaTags.value.findIndex(item => item === tag)
  if (index > -1) {
    currentAgendaTags.value.splice(index, 1)
  } else {
    currentAgendaTags.value.push(tag)
  }
}

// 保存标签修改
const saveTags = () => {
  if (!currentAgendaId.value) return
  agendaStore.saveAgendaTags(currentAgendaId.value, currentAgendaTags.value)
  tagDialogVisible.value = false
  showToast("标签保存成功")
}

// 打开备注编辑弹窗
const openRemarkDialog = (agenda) => {
  currentAgendaId.value = agenda.id
  currentRemark.value = agenda.remark || ""
  remarkDialogVisible.value = true
}

// 保存备注修改
const saveRemark = () => {
  if (!currentAgendaId.value) return
  agendaStore.saveAgendaRemark(currentAgendaId.value, currentRemark.value.trim())
  remarkDialogVisible.value = false
  showToast("备注保存成功")
}

// 删除备注
const deleteAgendaRemark = (agendaId) => {
  agendaStore.saveAgendaRemark(agendaId, "")
  showToast("备注已删除")
}

// 打开分享弹窗
const openShareDialog = (agenda) => {
  currentShareLink.value = `https://meeting-system.com/agenda/${agenda.id}?title=${encodeURIComponent(agenda.title)}`
  shareDialogVisible.value = true
}

// 复制分享链接到剪贴板
const copyLink = () => {
  navigator.clipboard.writeText(currentShareLink.value).then(() => {
    showToast("链接已复制到剪贴板")
  }).catch(() => {
    showToast("复制失败，请手动复制")
  })
}

// 切换议程收藏状态
const handleToggleCollect = (agendaId) => {
  agendaStore.toggleAgendaCollect(agendaId)
  const latestAgenda = agendaList.value.find(item => item.id === agendaId)
  if (latestAgenda) {
    showToast(latestAgenda.isCollected ? "收藏成功" : "已取消收藏")
  }
}

// 删除指定议程并清除对应提醒定时器
const handleDeleteAgenda = (agendaId) => {
  // 清除该议程对应的提醒定时器
  reminderTimers.value = reminderTimers.value.filter(item => {
    if (item.agendaId === agendaId) {
      clearTimeout(item.timer)
      return false
    }
    return true
  })

  // 确认删除
  if (confirm("确定要删除该议程吗？删除后不可恢复")) {
    agendaStore.agendaList = agendaList.value.filter(item => item.id !== agendaId)
    localStorage.setItem('agendaList', JSON.stringify(agendaStore.agendaList))
    showToast("议程已删除")
  }
}

// 打开编辑弹窗
const openEditDialog = (agenda) => {
  const editTime = agenda.time.replace(' ', 'T')
  editAgenda.value = {
    id: agenda.id,
    title: agenda.title,
    time: editTime
  }
  editDialogVisible.value = true
}

// 保存编辑修改
const handleEditAgenda = () => {
  if (!editAgenda.value.title.trim()) {
    return showToast("请输入议程标题")
  }
  agendaStore.updateAgenda(editAgenda.value.id, {
    title: editAgenda.value.title,
    time: editAgenda.value.time.replace('T', ' ')
  })
  editDialogVisible.value = false
  showToast("议程修改成功")
}

/**
 * 设置浏览器本地通知提醒（提前15分钟触发）
 * @param {object} agenda 议程对象
 */
const setBrowserReminder = (agenda) => {
  // 1. 解析议程时间
  const agendaTimeStr = agenda.time.replace(' ', 'T')
  const agendaDate = new Date(agendaTimeStr)
  const reminderDate = new Date(agendaDate.getTime() - 15 * 60 * 1000) // 提前15分钟

  // 2. 校验时间有效性
  if (!isFutureDate(agendaDate)) {
    return showToast('会议时间已过期，无法设置提醒')
  }
  if (!isFutureDate(reminderDate)) {
    return showToast('会议将在15分钟内开始，无法设置提前15分钟提醒')
  }

  // 3. 检查并请求浏览器通知权限
  if (Notification.permission !== 'granted') {
    Notification.requestPermission().then(permission => {
      if (permission !== 'granted') {
        return showToast('你已拒绝通知权限，无法接收浏览器提醒')
      }
      // 权限授权成功，创建提醒定时器
      createBrowserReminderTimer(agenda, reminderDate)
    }).catch(err => {
      console.error('请求通知权限失败：', err)
      showToast('请求通知权限失败，无法设置提醒')
    })
    return
  }

  // 4. 已授权，直接创建提醒定时器
  createBrowserReminderTimer(agenda, reminderDate)
}

/**
 * 创建浏览器提醒定时器
 * @param {object} agenda 议程对象
 * @param {Date} reminderDate 提醒触发日期
 */
const createBrowserReminderTimer = (agenda, reminderDate) => {
  // 清除该议程已存在的提醒定时器
  reminderTimers.value = reminderTimers.value.filter(item => {
    if (item.agendaId === agenda.id) {
      clearTimeout(item.timer)
      return false
    }
    return true
  })

  // 计算当前到提醒时间的差值
  const now = new Date()
  const timeDiff = reminderDate.getTime() - now.getTime()

  // 创建新的定时器
  const timer = setTimeout(() => {
    const notification = new Notification('【会议倒计时提醒】', {
      body: `《${agenda.title}》即将在15分钟后开始（会议时间：${agenda.time}），请做好准备！`,
      icon: '/favicon.ico', 
      requireInteraction: true, 
      tag: `agenda-reminder-${agenda.id}`
    })

    // 通知点击事件：聚焦到当前页面并关闭通知
    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    // 弹出内部提示
    showToast(`《${agenda.title}》即将开始，请注意查收！`)
  }, timeDiff)

  // 保存定时器到列表
  reminderTimers.value.push({
    agendaId: agenda.id,
    timer: timer
  })

  // 提示用户提醒已设置成功
  showToast(`提醒已设置成功！将在${formatLocaleTime(reminderDate)}发送通知（会议提前15分钟）`)
}

/**
 * 添加议程到手机原生日历（兼容iOS/Android）
 * @param {object} agenda 议程对象
 */
const addToMobileCalendar = (agenda) => {
  // 1. 解析议程时间
  const agendaTimeStr = agenda.time.replace(' ', 'T')
  const agendaDate = new Date(agendaTimeStr)

  // 2. 校验时间有效性
  if (!isFutureDate(agendaDate)) {
    return showToast('会议时间已过期，无法添加到日历')
  }

  // 3. 设定会议结束时间（默认1小时）
  const endDate = new Date(agendaDate.getTime() + 1 * 60 * 60 * 1000)

  // 4. 格式化日历所需日期
  const startDateStr = formatCalendarDate(agendaDate)
  const endDateStr = formatCalendarDate(endDate)
  if (!startDateStr || !endDateStr) {
    return showToast('格式化日期失败，无法添加到日历')
  }

  // 5. 构造日历事件内容
  const calendarTitle = encodeURIComponent(`【会议】${agenda.title}`)
  const calendarDesc = encodeURIComponent(`会议时间：${agenda.time}\\n备注：${agenda.remark || '无'}\\n标签：${agenda.tags.join('、') || '无'}`)

  // 6. 兼容iOS和Android系统
  let calendarUrl = ''
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)

  if (isIOS) {
    // iOS：生成iCal格式文件，触发下载.ics
    calendarUrl = `data:text/calendar;charset=utf-8,BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Meeting System//CN//EN
BEGIN:VEVENT
TITLE:${calendarTitle}
DESCRIPTION:${calendarDesc}
DTSTART:${startDateStr}
DTEND:${endDateStr}
PRIORITY:5
END:VEVENT
END:VCALENDAR`.replace(/\\n/g, '')
  } else {
    // Android：唤起Google日历（兼容国产日历APP）
    calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE
&text=${calendarTitle}
&details=${calendarDesc}
&dates=${startDateStr}/${endDateStr}
&hl=zh-CN
&ctz=Asia/Shanghai`.replace(/\\n/g, '')
  }

  // 7. 触发日历跳转/下载
  const link = document.createElement('a')
  link.href = calendarUrl
  link.download = isIOS ? `${agenda.title}.ics` : ''
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // 8. 提示用户操作结果
  showToast(isIOS ? '日历文件已生成，请导入手机日历' : '正在唤起日历APP，请稍候')
}
</script>

<style scoped>

.home-page {
  min-height: 100vh;
  box-sizing: border-box;
  background-color: #f5f5f5;
}

.home-scroll-content {
  padding: 1em;
  padding-bottom: 4.5em; 
  overflow-y: auto;
  height: calc(100vh - 0px);
  box-sizing: border-box;
}

.page-content {
  width: 100%;
  box-sizing: border-box;
}

.mb-4 {
  margin-bottom: 1.2em;
}

.card-title {
  font-weight: bold;
  color: #333;
  margin: 0;
}

/* 会议状态 */
.upcoming-container {
  padding: 0.6em 0;
}

.upcoming-item {
  padding: 1em;
  border-radius: 0.6em;
  margin-bottom: 0.6em;
  transition: all 0.3s ease;
}

/* 正在进行 */
.upcoming-item.status-ongoing {
  background-color: #fff7e6;
  border: 1px solid #fa8c16;
}

.upcoming-item.status-ongoing .upcoming-status-tag {
  background-color: #fa8c16;
  color: #fff;
}

/* 即将开始 */
.upcoming-item.status-upcoming {
  background-color: #f0fff4;
  border: 1px solid #52c41a;
}

.upcoming-item.status-upcoming .upcoming-status-tag {
  background-color: #52c41a;
  color: #fff;
}

/* 已结束 */
.upcoming-item.status-ended {
  background-color: #f5f5f5;
  border: 1px solid #d9d9d9;
}

.upcoming-item.status-ended .upcoming-status-tag {
  background-color: #8c8c8c;
  color: #fff;
}

.upcoming-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6em;
}

.upcoming-title {
  font-weight: 500;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upcoming-status-tag {
  padding: 0.3em 0.6em;
  border-radius: 1.2em;
  white-space: nowrap;
}

.upcoming-time {
  color: #666;
  margin-bottom: 0.6em;
}

.upcoming-tags {
  display: flex;
  gap: 0.5em;
  flex-wrap: wrap;
}

/* 重要通知 */
.notice-container {
  padding: 0.6em 0;
}

.notice-empty {
  color: #999;
  text-align: center;
  padding: 1.5em 0;
}

.notice-item {
  padding: 1em 0;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6em;
}

.notice-type {
  font-weight: 500;
  color: #333;
}

.notice-status {
  padding: 0.3em 0.6em;
  border-radius: 1.2em;
  background-color: #e6f7ff;
  color: #1989fa;
}

.notice-status.已生效 {
  background-color: #f0fff4;
  color: #52c41a;
}

.notice-content {
  color: #666;
  line-height: 1.7;
}

.notice-title {
  font-weight: 500;
  color: #333;
  margin: 0 0 0.3em 0;
}

.notice-desc {
  margin: 0 0 0.3em 0;
}

.notice-time {
  color: #999;
  margin: 0;
}

.notice-divider {
  height: 1px;
  background-color: #f0f0f0;
  margin: 1em 0;
}

/* 加载/错误提示 */
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 999;
}

.loading-content {
  color: #1989fa;
}

.error-bar {
  background-color: #fff2f2;
  color: #ff4d4f;
  padding: 0.8em;
  border-radius: 0.4em;
  margin-bottom: 0.8em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.error-close {
  font-weight: bold;
}

/* 议程列表 */
.agenda-list {
  width: 100%;
}

.empty-tip {
  color: #999;
  text-align: center;
  padding: 3em 0;
  background-color: #fff;
  border-radius: 0.6em;
  margin-bottom: 0.8em;
}

.agenda-item {
  background-color: #ffffff;
  border-radius: 0.6em;
  padding: 1.2em;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 0.8em;
}

.agenda-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1em;
  padding-bottom: 0.6em;
  border-bottom: 1px solid #f0f0f0;
}

.agenda-title {
  font-weight: 500;
  color: #333;
  cursor: pointer;
  word-wrap: break-word;
  line-height: 1.6;
  flex: 1;
  margin-right: 1.2em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agenda-time {
  color: #666;
  background-color: #f5fafe;
  padding: 0.3em 0.5em;
  border-radius: 0.4em;
  white-space: nowrap;
}

/* 议程操作按钮 */
.agenda-actions {
  display: flex;
  gap: 1em;
  margin-bottom: 1em;
  flex-wrap: wrap;
}

.btn-normal {
  background-color: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 0.4em;
  cursor: pointer;
  transition: background-color 0.3s ease;
  padding: 0.3em 0.5em;
}

.btn-normal:hover {
  background-color: #e5e5e5;
}

.btn-normal.collected {
  background-color: #fff2f2;
  color: #ff4d4f;
}

.btn-danger {
  background-color: #ff4d4f;
  color: #ffffff;
  border: none;
  border-radius: 0.4em;
  cursor: pointer;
  padding: 0.4em 0.6em;
  transition: background-color 0.3s ease;
}

.btn-danger:hover {
  background-color: #ff3333;
}

.mini-btn {
  white-space: nowrap;
}

/* 标签 */
.agenda-tags {
  display: flex;
  gap: 0.5em;
  margin-bottom: 1em;
  flex-wrap: wrap;
}

.tag-item {
  padding: 0.3em 0.5em;
  background-color: #e6f7ff;
  color: #1989fa;
  border-radius: 0.4em;
}
.agenda-title{
  font-weight: 500;
  
}

/* 备注 */
.agenda-remark {
  margin-top: 1em;
  padding-top: 1em;
  border-top: 1px solid #f0f0f0;
}

.remark-label {
  color: #666;
  margin-bottom: 0.4em;
}

.remark-content {
  color: #333;
  line-height: 1.7;
  padding: 0.6em;
  background-color: #f9f9f9;
  border-radius: 0.4em;
  margin-bottom: 0.6em;
  min-height: 3em;
}

.remark-actions {
  display: flex;
  gap: 0.5em;
  justify-content: flex-start;
}

.remark-edit {
  background-color: #e6f7ff !important;
  color: #1989fa !important;
}

/* 弹窗通用 */
.dialog-mask {
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

.dialog-content {
  background-color: #ffffff;
  border-radius: 0.6em;
  padding: 1.5em;
  width: 80%;
  max-width: 28em;
}

.dialog-lg {
  width: 90%;
  max-width: 35em;
  max-height: 80vh;
  overflow-y: auto;
}

.dialog-title {
  font-weight: bold;
  color: #333;
  margin-bottom: 1.2em;
  text-align: center;
}

.form-item {
  margin-bottom: 1.2em;
}

.form-label {
  color: #333;
  margin-bottom: 0.4em;
  display: block;
}

.form-input {
  width: 100%;
  padding: 0.6em 0.8em;
  border: 1px solid #e5e5e5;
  border-radius: 0.4em;
  box-sizing: border-box;
}

.dialog-btn-group {
  display: flex;
  gap: 0.8em;
}

.dialog-cancel-btn {
  flex: 1;
  padding: 0.8em 0;
  background-color: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 0.4em;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.dialog-cancel-btn:hover {
  background-color: #e5e5e5;
}

.dialog-confirm-btn {
  width: 50%;
  padding: 0.8em 0;
  background-color: #1989fa;
  color: #ffffff;
  border: none;
  border-radius: 0.4em;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.dialog-confirm-btn:hover {
  background-color: #096dd9;
}

/* 标签选择弹窗 */
.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6em;
  margin-bottom: 1.5em;
}

.tag-option {
  padding: 0.5em 1em;
  background-color: #f5f5f5;
  border-radius: 0.4em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag-option.selected {
  background-color: #e6f7ff;
  color: #1989fa;
}

/* 备注弹窗 */
.remark-input {
  width: 100%;
  padding: 0.8em;
  border: 1px solid #e5e5e5;
  border-radius: 0.4em;
  box-sizing: border-box;
  resize: none;
  margin-bottom: 1.2em;
}

/* 分享弹窗 */
.share-content {
  margin-bottom: 1.5em;
}

.share-tips {
  color: #333;
  margin-bottom: 0.6em;
}

.share-link {
  padding: 0.6em;
  background-color: #f5f5f5;
  border-radius: 0.4em;
  word-break: break-all;
  color: #666;
  margin-bottom: 0.8em;
}

.btn-primary {
  background-color: #1989fa;
  color: #fff;
  border: none;
  border-radius: 0.4em;
  padding: 0.5em 1em;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background-color: #096dd9;
}

/* 提示样式 */
.toast-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  pointer-events: none;
}

.toast-content {
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  padding: 1em 1.5em;
  border-radius: 1.5em;
}
.notice-item[data-v-a763a6ae] {
    padding: 1em 0;
}

</style>