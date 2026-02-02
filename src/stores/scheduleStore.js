import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useAgendaStore } from './agendaStore';

export const useScheduleStore = defineStore('schedule', () => {
  const agendaStore = useAgendaStore();

  // 核心状态
  const notifications = ref([]);
  const coreScheduleTime = ref({
    meetingTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    personalSchedule: []
  });

  // 收藏的流程步骤（本地存储持久化）
  const collectedFlowSteps = ref(
    JSON.parse(localStorage.getItem('collectedFlowSteps') || '[]')
  );

  // 个人专属日程（所有流程步骤）
  const personalSchedule = computed(() => {
    const _ = agendaStore.agendaList; 
    const allSteps = [];

    agendaStore.agendaList.forEach(agenda => {
      if (agenda.flows && agenda.flows.length) {
        agenda.flows.forEach((step, stepIndex) => {
          const isCollected = collectedFlowSteps.value.some(item => 
            item.agendaId === agenda.id && item.stepIndex === stepIndex
          );
          const isEnded = isStepEnded(step.time || agenda.time);
          
          allSteps.push({
            id: `${agenda.id}-${stepIndex}`,
            agendaId: agenda.id,
            stepIndex,
            title: step.title || '未命名步骤',
            time: step.time || agenda.time || '时间未设置',
            content: step.title || '未命名步骤', 
            desc: step.desc || '无描述',
            icon: 'calendar-o', 
            isCollected,
            isEnded,
            countdown: calculateCountdown(step.time || agenda.time)
          });
        });
      }
    });

    return allSteps;
  });

  // 想听日程（仅已收藏的流程步骤）
  const wishSchedule = computed(() => {
    const _ = agendaStore.agendaList;
    const collectedSteps = [];

    collectedFlowSteps.value.forEach(collected => {
      const agenda = agendaStore.agendaList.find(item => item.id === collected.agendaId);
      if (agenda && agenda.flows && agenda.flows[collected.stepIndex]) {
        const step = agenda.flows[collected.stepIndex];
        const isEnded = isStepEnded(step.time || agenda.time);
        
        collectedSteps.push({
          id: `${agenda.id}-${collected.stepIndex}`,
          agendaId: agenda.id,
          stepIndex: collected.stepIndex,
          title: step.title || '未命名步骤',
          time: step.time || agenda.time || '时间未设置',
          content: step.title || '未命名步骤',
          desc: step.desc || '无描述',
          icon: 'calendar-o', 
          isEnded,
          countdown: calculateCountdown(step.time || agenda.time)
        });
      }
    });

    return collectedSteps;
  });

  // 判断流程是否已结束
  function isStepEnded(timeStr) {
    if (!timeStr) return false;
    
    try {
      let endTime;
      if (timeStr.includes('-') && !timeStr.includes('T')) {
        const [_, endStr] = timeStr.split('-').map(t => t.trim());
        const today = new Date();
        const [endHour, endMinute] = endStr.split(':').map(Number);
        endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), endHour, endMinute);
      } 
      else {
        const formattedTime = timeStr.replace(' ', 'T');
        endTime = new Date(formattedTime);
        if (!isNaN(endTime.getTime()) && endTime.getHours() === 0 && endTime.getMinutes() === 0) {
          endTime = new Date(endTime);
          endTime.setHours(23, 59, 59);
        }
      }
      
      return !isNaN(endTime.getTime()) && new Date() > endTime;
    } catch (error) {
      console.error('判断流程是否结束失败:', error);
      return false;
    }
  }

  // 计算倒计时
  function calculateCountdown(timeStr) {
    if (!timeStr) return '时间未设置';
    
    try {
      let startTime;
      // 处理时间段格式
      if (timeStr.includes('-') && !timeStr.includes('T')) {
        const [startStr] = timeStr.split('-').map(t => t.trim());
        const today = new Date();
        const [startHour, startMinute] = startStr.split(':').map(Number);
        startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), startHour, startMinute);
      } 
      else {
        const formattedTime = timeStr.replace(' ', 'T');
        startTime = new Date(formattedTime);
      }

      // 验证时间是否有效
      if (isNaN(startTime.getTime())) {
        return '时间格式错误';
      }
      
      const now = new Date();
      const diff = startTime - now;

      // 已结束
      if (diff < 0) return '已结束';

      // 计算天、时、分、秒
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      // 拼接倒计时文本
      let countdownText = '';
      if (days > 0) {
        countdownText += `${days}天`;
      }
      if (hours > 0 || days > 0) {
        countdownText += `${hours}时`;
      }
      if (minutes > 0 || hours > 0 || days > 0) {
        countdownText += `${minutes}分`;
      }
      countdownText += `${seconds}秒后开始`;
      
      return countdownText;
    } catch (error) {
      console.error('计算倒计时失败:', error);
      return '时间解析失败';
    }
  }
  // 切换收藏状态
  const toggleFlowStepCollect = (agendaId, stepIndex) => {
    const index = collectedFlowSteps.value.findIndex(item => 
      item.agendaId === agendaId && item.stepIndex === stepIndex
    );
    if (index > -1) {
      // 取消收藏
      collectedFlowSteps.value.splice(index, 1);
    } else {
      // 新增收藏
      collectedFlowSteps.value.push({ agendaId, stepIndex });
    }
    // 同步到本地存储
    localStorage.setItem('collectedFlowSteps', JSON.stringify(collectedFlowSteps.value));
    // 触发计算属性更新
    coreScheduleTime.value = { ...coreScheduleTime.value };
  };

  // 判断是否已收藏
  const isFlowStepCollected = (agendaId, stepIndex) => {
    return collectedFlowSteps.value.some(item => 
      item.agendaId === agendaId && item.stepIndex === stepIndex
    );
  };

  // 清空个人专属日程中已结束的项
  const clearEndedPersonalSchedule = () => {
    try {
      const endedItems = personalSchedule.value.filter(item => item.isEnded);
      if (endedItems.length === 0) return;
      
      // 移除已结束项的收藏状态
      endedItems.forEach(item => {
        const { agendaId, stepIndex } = item;
        const collectIndex = collectedFlowSteps.value.findIndex(col => 
          col.agendaId === agendaId && col.stepIndex === stepIndex
        );
        if (collectIndex > -1) {
          collectedFlowSteps.value.splice(collectIndex, 1);
        }
      });
      
      // 同步到本地存储
      localStorage.setItem('collectedFlowSteps', JSON.stringify(collectedFlowSteps.value));
      // 触发更新
      coreScheduleTime.value = { ...coreScheduleTime.value };
      console.log(`已自动清空 ${endedItems.length} 个已结束的日程`);
    } catch (error) {
      console.error('自动清空已结束日程失败:', error);
    }
  };

  // 自动清空定时器
  const getTomorrow8AM = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    return tomorrow.getTime();
  };

  const startAutoClearTimer = () => {
    // 防止重复启动
    if (window.autoClearTimer) {
      clearTimeout(window.autoClearTimer);
    }
    
    const now = new Date().getTime();
    const tomorrow8AM = getTomorrow8AM();
    const delay = tomorrow8AM - now;

    // 设置定时器
    window.autoClearTimer = setTimeout(() => {
      clearEndedPersonalSchedule();
      // 循环启动下一天的定时器
      startAutoClearTimer();
    }, delay);
    console.log(`自动清空定时器已启动，将在 ${new Date(tomorrow8AM).toLocaleString()} 执行`);
  };

  watch(collectedFlowSteps, () => {
    // 确保只启动一次定时器
    if (!window.autoClearTimerStarted) {
      startAutoClearTimer();
      window.autoClearTimerStarted = true;
    }
  }, { immediate: true });

  // 其他辅助方法
  const addAgendaEditNotification = (agenda) => {
    notifications.value.unshift({
      id: Date.now(),
      title: `议程「${agenda.title}」已更新`,
      content: `更新后时间：${agenda.time}`,
      status: '已生效',
      createTime: new Date().toLocaleString()
    });
  };

  // 清空通知
  const clearNotifications = () => {
    notifications.value = [];
  };

  return {
    // 状态
    notifications,
    coreScheduleTime,
    personalSchedule,
    wishSchedule,
    // 方法
    toggleFlowStepCollect,
    isFlowStepCollected,
    calculateCountdown,
    addAgendaEditNotification,
    clearNotifications,
    clearEndedPersonalSchedule
  };
});