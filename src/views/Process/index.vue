<template>
  <div class="meeting-venue-container">
    <!-- 宣传图 -->
    <div class="meeting-banner">
      <img
        class="banner-img"
        :src="bannerImageUrl || defaultBannerUrl"
        alt="会议宣传图"
        loading="lazy"
      />
    </div>

    <!-- 标题 -->
    <div class="page-title-wrap">
      <h1 class="page-title">会议会场详情</h1>
    </div>

    <!-- 会场切换标签 -->
    <div class="tab-switch-container">
      <div
        class="tab-item"
        v-for="(venue, index) in customVenues"
        :key="venue.id"
        :class="{ active: activeVenueId === venue.id }"
        @click="switchVenue(venue.id)"
      >
        {{ venue.name }}
      </div>
    </div>

    <!-- 空会场提示 -->
    <div class="empty-venue-tip" v-if="customVenues.length === 0">
      暂无自定义会场，请先在个人中心创建会场
    </div>

    <!-- 会场内容 -->
    <div class="page-content" v-else>
      <!-- 当前会场信息卡片 -->
      <div
        class="venue-card"
        :style="{ borderLeft: `4px solid ${currentVenue.color}` }"
      >
        <div class="venue-header">
          <span
            class="venue-tag"
            :style="{ backgroundColor: currentVenue.color }"
            >{{ currentVenue.type }}</span
          >
          <h2 class="venue-title">{{ currentVenue.name }}</h2>
        </div>
        <div class="venue-info">
          <div class="info-item">
            <span class="info-label">会议时间：</span>
            <span class="info-content">{{ currentVenue.time }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">会议地址：</span>
            <span class="info-content">{{ currentVenue.address }}</span>
          </div>
          <div class="info-item content-item">
            <span class="info-label">会场描述：</span>
            <div class="info-content content-desc">
              {{ currentVenue.desc || "无描述" }}
            </div>
          </div>
        </div>
      </div>

      <!-- 当前会场的议程列表 -->
      <div class="flow-content">
        <div class="flow-header">
          <h3 class="flow-title">{{ currentVenue.name }}会议流程</h3>
        </div>

        <!-- 空议程提示 -->
        <div class="empty-tip" v-if="currentVenueAgendas.length === 0">
          暂无该会场的议程，请先在个人中心创建议程
        </div>

        <!-- 议程列表 -->
        <div class="flow-step-list" v-else>
          <div
            class="agenda-item"
            v-for="(agenda, aIndex) in currentVenueAgendas"
            :key="agenda.id"
          >
            <!-- 议程标题 -->
            <div
              class="agenda-title"
              @click="toggleAgendaExpand(agenda.id)"
              :style="{ borderLeftColor: currentVenue.color }"
            >
              <span
                class="agenda-num"
                :style="{ backgroundColor: currentVenue.color, color: '#fff' }"
              >
                {{ aIndex + 1 }}
              </span>
              <span
                class="expand-icon"
                :class="{ expanded: expandedAgendaIds.includes(agenda.id) }"
              >
                {{ expandedAgendaIds.includes(agenda.id) ? "▼" : "▶" }}
              </span>
              {{ agenda.title }}
            </div>

            <!-- 当前议程的流程步骤 -->
            <div
              class="custom-flow-list"
              v-if="expandedAgendaIds.includes(agenda.id)"
            >
              <div
                class="custom-flow-step"
                v-for="(step, sIndex) in agenda.flows"
                :key="`${agenda.id}-${sIndex}`"
              >
                <div class="custom-step-header">
                  <span
                    class="custom-step-num"
                    :style="{
                      backgroundColor: currentVenue.color,
                      color: '#fff',
                    }"
                  >
                    {{ sIndex + 1 }}
                  </span>
                  <div class="step-info-wrap">
                    <h4 class="custom-step-title">{{ step.title }}</h4>
                    <div class="custom-step-desc">
                      {{ step.desc || "无描述" }}
                    </div>
                    <div class="step-meta">
                      <span
                        class="custom-step-time"
                        :style="{ color: currentVenue.color }"
                      >
                        {{ formatTime(step.time || agenda.time) }}
                      </span>
                      <span class="custom-step-address">
                        地址：{{ step.address || currentVenue.address }}
                      </span>
                    </div>
                    <!-- 收藏/备注 -->
                    <div class="step-actions-bottom">
                      <span
                        class="action-btn collect-btn"
                        :class="{
                          collected: isFlowStepCollected(agenda.id, sIndex),
                        }"
                        @click.stop="toggleFlowStepCollect(agenda.id, sIndex)"
                      >
                        {{
                          isFlowStepCollected(agenda.id, sIndex)
                            ? "已收藏"
                            : "收藏"
                        }}
                      </span>
                      <span
                        class="action-btn remark-btn"
                        @click.stop="
                          openFlowStepRemarkModal(agenda.id, sIndex, step)
                        "
                      >
                        {{
                          getFlowStepRemark(agenda.id, sIndex)
                            ? "已备注"
                            : "备注"
                        }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 流程步骤备注弹窗 -->
  <div
    class="modal-mask"
    v-if="stepRemarkModalVisible"
    @click="closeStepRemarkModal"
  >
    <div class="modal-content" @click.stop>
      <h3 class="modal-title">备注 - {{ currentStepRemarkTitle }}</h3>
      <textarea
        class="form-input remark-input"
        v-model="currentStepRemarkContent"
        placeholder="请输入备注内容..."
        rows="3"
      ></textarea>
      <div class="modal-btns">
        <button class="modal-btn cancel-btn" @click="closeStepRemarkModal">
          取消
        </button>
        <button class="modal-btn confirm-btn" @click="saveFlowStepRemark">
          保存备注
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useAgendaStore } from "../../stores/agendaStore";
import { useScheduleStore } from "../../stores/scheduleStore";

// 初始化仓库
const agendaStore = useAgendaStore();
const scheduleStore = useScheduleStore();

// 会场数据
const customVenues = ref(
  JSON.parse(localStorage.getItem("customVenues")) || []
);
// 备注数据
const userRemarks = ref(
  JSON.parse(localStorage.getItem("userRemarks")) || {
    agendas: {},
    flowSteps: {},
  }
);

// 宣传图数据
const bannerImageUrl = ref(localStorage.getItem("meetingBannerUrl") || "");
const defaultBannerUrl = ref(
  "https://img.ixintu.com/download/jpg/202308/6673017c157638922.jpg"
);

const activeVenueId = ref(customVenues.value[0]?.id || "");
const expandedAgendaIds = ref([]);

const stepRemarkModalVisible = ref(false);
const currentStepRemarkAgendaId = ref("");
const currentStepRemarkIndex = ref(-1);
const currentStepRemarkTitle = ref("");
const currentStepRemarkContent = ref("");

// 当前选中的会场
const currentVenue = computed(() => {
  return (
    customVenues.value.find((venue) => venue.id === activeVenueId.value) || {}
  );
});

// 会场的议程
const currentVenueAgendas = computed(() => {
  return agendaStore.agendaList.filter(
    (agenda) => agenda.venueId === activeVenueId.value
  );
});

// 时间格式化方法
function formatTime(datetimeStr) {
  if (!datetimeStr) return "未设置";

  let date;
  if (datetimeStr.includes("T")) {
    date = new Date(datetimeStr);
  } else if (datetimeStr.includes(" ")) {
    const [datePart, timePart] = datetimeStr.split(" ");
    date = new Date(`${datePart}T${timePart}`);
  } else {
    date = new Date(datetimeStr);
  }

  if (isNaN(date.getTime())) {
    if (datetimeStr.includes("-")) return datetimeStr;
    return "时间格式错误";
  }

  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")} - ${
    date.getHours() + 1
  }:${String(date.getMinutes()).padStart(2, "0")}`;
}

// 同步数据到本地存储
function syncGlobalDataToLocal() {
  localStorage.setItem("userRemarks", JSON.stringify(userRemarks.value));
  localStorage.setItem("customVenues", JSON.stringify(customVenues.value));
}

function isFlowStepCollected(agendaId, stepIndex) {
  return scheduleStore.isFlowStepCollected(agendaId, stepIndex);
}

function toggleFlowStepCollect(agendaId, stepIndex) {
  // 收藏切换
  scheduleStore.toggleFlowStepCollect(agendaId, stepIndex);
  // 更新收藏状态
  agendaStore.toggleAgendaCollect(agendaId);

  setTimeout(() => {
    agendaStore.agendaList = [...agendaStore.agendaList];
  }, 0);
}

// 备注
function getFlowStepRemark(agendaId, stepIndex) {
  const key = `${agendaId}_${stepIndex}`;
  return userRemarks.value.flowSteps[key] || "";
}

function openFlowStepRemarkModal(agendaId, stepIndex, step) {
  currentStepRemarkAgendaId.value = agendaId;
  currentStepRemarkIndex.value = stepIndex;
  currentStepRemarkTitle.value = step.title;
  currentStepRemarkContent.value = getFlowStepRemark(agendaId, stepIndex);
  stepRemarkModalVisible.value = true;
}

function closeStepRemarkModal() {
  stepRemarkModalVisible.value = false;
  currentStepRemarkContent.value = "";
}

function saveFlowStepRemark() {
  if (currentStepRemarkAgendaId.value && currentStepRemarkIndex.value > -1) {
    const key = `${currentStepRemarkAgendaId.value}_${currentStepRemarkIndex.value}`;
    if (currentStepRemarkContent.value.trim()) {
      userRemarks.value.flowSteps[key] = currentStepRemarkContent.value.trim();
    } else {
      delete userRemarks.value.flowSteps[key];
    }
    syncGlobalDataToLocal();
    closeStepRemarkModal();
  }
}

// 切换会场
function switchVenue(venueId) {
  activeVenueId.value = venueId;
  expandedAgendaIds.value = [];
}

// 切换议程的折叠/展开状态
function toggleAgendaExpand(agendaId) {
  if (expandedAgendaIds.value.includes(agendaId)) {
    expandedAgendaIds.value = expandedAgendaIds.value.filter(
      (id) => id !== agendaId
    );
  } else {
    expandedAgendaIds.value.push(agendaId);
  }
}

// 页面挂载逻辑
onMounted(() => {
  // 加载议程数据
  agendaStore.loadAgendaFromLocalStorage();

  // 同步数据
  window.addEventListener("storage", (e) => {
    if (e.key === "userRemarks") {
      userRemarks.value = JSON.parse(
        e.newValue || JSON.stringify({ agendas: {}, flowSteps: {} })
      );
    } else if (e.key === "customVenues") {
      customVenues.value = JSON.parse(e.newValue || "[]");
      if (customVenues.value.length > 0 && !activeVenueId.value) {
        activeVenueId.value = customVenues.value[0].id;
      }
    } else if (e.key === "agendaList") {
      agendaStore.loadAgendaFromLocalStorage();
    } else if (e.key === "collectedFlowSteps") {
      // 更新收藏状态
      scheduleStore.collectedFlowSteps = JSON.parse(e.newValue || "[]");
      scheduleStore.coreScheduleTime = { ...scheduleStore.coreScheduleTime };
    }
  });

  // 监听数据变化，自动保存
  watch(
    customVenues,
    () => {
      localStorage.setItem("customVenues", JSON.stringify(customVenues.value));
    },
    { deep: true }
  );

  watch(
    userRemarks,
    () => {
      syncGlobalDataToLocal();
    },
    { deep: true }
  );

  watch(
    () => agendaStore.agendaList,
    () => {
      scheduleStore.coreScheduleTime = { ...scheduleStore.coreScheduleTime };
    },
    { deep: true }
  );
});
</script>
<style scoped>
/* 基础重置：统一字体和间距基准 */
:root {
  font-size: 14px; /* PC端基础字体大小 */
}

/* 根容器：强制全屏+开启垂直滚动（核心修复），解决底部内容截断 */
.meeting-venue-container {
  min-height: 100vh;
  height: 100vh; /* 固定视口高度，触发滚动条件 */
  background-color: #f5f5f5;
  padding: 0;
  margin: 0;
  overflow-y: auto; /* 开启垂直滚动，内容超出时显示滚轮 */
  overflow-x: hidden; /* 隐藏横向多余滚动，优化视觉 */
}

/* 宣传图：固定高度+限制宽度 */
.meeting-banner {
  width: 100%;
  height: 200px;
  overflow: hidden;
  margin: 0 auto;
  max-width: 1200px; /* 和内容区保持一致 */
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 标题：增加间距和字体大小 */
.page-title-wrap {
  padding: 1.5em 1em;
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

/* 会场切换标签：优化样式和间距 */
.tab-switch-container {
  display: flex;
  gap: 12px;
  padding: 1em;
  overflow-x: auto;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  white-space: nowrap;
  max-width: 1200px;
  margin: 0 auto;
}

.tab-item {
  padding: 8px 16px;
  border-radius: 6px;
  background-color: #f5f5f5;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.tab-item.active {
  background-color: #1989fa;
  color: #fff;
}

.tab-item:hover {
  background-color: #e6f7ff;
  color: #1989fa;
}

/* 空会场提示：优化间距和字体 */
.empty-venue-tip {
  color: #999;
  text-align: center;
  padding: 2em 0;
  background-color: #fafafa;
  margin: 1em auto;
  border-radius: 8px;
  width: 100%;
  max-width: 1200px;
  box-sizing: border-box;
  font-size: 14px;
}

/* 内容区域：固定最大宽度+居中+间距 */
.page-content {
  padding: 2em 1.5em;
  width: 100%;
  max-width: 1200px;
  box-sizing: border-box;
  margin: 0 auto;
  min-width: 320px;
  /* 新增：防止内容横向溢出 */
  overflow: visible;
      margin-bottom: 100px;
}

/* 会场信息卡片：优化内边距和字体 */
.venue-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 2em;
  margin-bottom: 2em;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
}

.venue-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1.5em;
  flex-wrap: wrap;
}

.venue-tag {
  padding: 6px 12px;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
}

.venue-title {
  font-size: 20px;
  color: #333;
  margin: 0;
  flex: 1;
}

.venue-info {
  margin-top: 1.5em;
}

.info-item {
  display: flex;
  margin-bottom: 1em;
  flex-wrap: wrap;
  font-size: 14px;
}

.info-label {
  color: #666;
  font-weight: 500;
  width: 6em;
  flex-shrink: 0;
}

.info-content {
  color: #333;
  flex: 1;
}

.content-item {
  flex-direction: column;
}

.content-desc {
  margin-top: 0.5em;
  padding: 1em;
  background-color: #f9f9f9;
  border-radius: 6px;
  line-height: 1.6;
  width: 100%;
  font-size: 14px;
}

/* 流程内容：优化样式 + 可选内部滚动（防止单区域溢出） */
.flow-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 2em;
  margin-bottom: 2em;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
  /* 可选：若流程内容过多，开启内部滚动 */
  /* max-height: 600px; */
  /* overflow-y: auto; */
}

.flow-header {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 1em;
  margin-bottom: 1.5em;
}

.flow-title {
  font-size: 18px;
  color: #333;
  margin: 0;
}

/* 空议程提示 */
.empty-tip {
  color: #999;
  text-align: center;
  padding: 2em 0;
  background-color: #fafafa;
  border-radius: 8px;
  margin: 1em 0;
  width: 100%;
  box-sizing: border-box;
  font-size: 14px;
}

/* 议程列表：优化间距和字体 */
.flow-step-list {
  display: flex;
  flex-direction: column;
  gap: 1.5em;
  width: 100%;
}

.agenda-item {
  margin-bottom: 1.5em;
  width: 100%;
}

.agenda-title {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 1em;
  background-color: #f5fafe;
  border-left: 4px solid #1989fa;
  border-radius: 0 6px 6px 0;
  cursor: pointer;
  color: #333;
  transition: background-color 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  font-size: 16px;
}

.agenda-title:hover {
  background-color: #e6f7ff;
}

.agenda-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.expand-icon {
  color: #666;
  transition: transform 0.3s ease;
  margin-left: auto;
  font-size: 16px;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

/* 自定义流程列表：优化间距 */
.custom-flow-list {
  margin-left: 30px;
  margin-top: 1em;
  display: flex;
  flex-direction: column;
  gap: 1em;
  width: 100%;
}

.custom-flow-step {
  padding: 1em;
  background-color: #f9f9f9;
  border-radius: 6px;
  width: 100%;
  box-sizing: border-box;
  font-size: 14px;
}

.custom-step-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.custom-step-num {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
  margin-top: 0.2em;
  font-size: 12px;
}

.step-info-wrap {
  flex: 1;
}

.custom-step-title {
  font-size: 16px;
  color: #333;
  margin: 0 0 0.5em 0;
}

.custom-step-desc {
  color: #666;
  margin-bottom: 0.5em;
  line-height: 1.5;
}

.step-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 1em;
}

.custom-step-time {
  font-weight: 500;
}

.custom-step-address {
  color: #666;
}

.step-actions-bottom {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 12px;
}

.collect-btn {
  background-color: #f5fafe;
  color: #1989fa;
}

.collect-btn.collected {
  background-color: #1989fa;
  color: #fff;
}

.remark-btn {
  background-color: #faf5e6;
  color: #ff9500;
}

/* 备注弹窗：优化样式 */
.modal-mask {
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

.modal-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 2em;
  width: 90%;
  max-width: 500px;
  min-width: 280px;
  box-sizing: border-box;
}

.modal-title {
  font-size: 18px;
  color: #333;
  margin: 0 0 1em 0;
  text-align: center;
}

.remark-input {
  width: 100%;
  padding: 1em;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  min-height: 100px;
  resize: vertical;
  box-sizing: border-box;
  font-size: 14px;
}

.modal-btns {
  display: flex;
  gap: 16px;
  margin-top: 1.5em;
  flex-wrap: wrap;
}

.modal-btn {
  flex: 1;
  padding: 12px 0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.3s ease;
  min-width: 120px;
  font-size: 14px;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background-color: #1989fa;
  color: #fff;
}

.modal-btn:hover {
  opacity: 0.9;
}
</style>