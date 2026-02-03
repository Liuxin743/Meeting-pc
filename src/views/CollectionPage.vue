<template>
  <div class="collection-page">
    <!-- 头部-->
    <div class="page-header">
      <van-icon 
        name="arrow-left" 
        size="20" 
        color="#1989fa" 
        class="back-icon" 
        @click="goBack"
      />
      <div class="page-title">我的收藏</div>
    </div>

    <div class="page-content">
      <div class="collection-card card-common">
        <!-- 空数据提示 -->
        <div class="empty-tip" v-if="collectedAgendas.length === 0">
          暂无收藏的议程
        </div>
        <!-- 收藏列表 -->
        <div class="collection-list" v-else>
          <div class="collection-item" v-for="agenda in collectedAgendas" :key="agenda.id">
            <div class="collection-header">
              <div class="collection-title">{{ agenda.title }}</div>
              <div class="collection-time">{{ agenda.time }}</div>
            </div>
            <!-- 标签展示 -->
            <div class="collection-tags" v-if="agenda.tags.length > 0">
              <span class="tag-item" v-for="tag in agenda.tags" :key="tag">{{ tag }}</span>
            </div>
            <!-- 取消收藏按钮 -->
            <button class="btn-danger mini-btn cancel-collect" @click="handleCancelCollect(agenda.id)">
              取消收藏
            </button>
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
// 收藏列表（实时响应式更新）
const collectedAgendas = ref([])

// 刷新收藏列表
const refreshCollectionList = () => {
  collectedAgendas.value = agendaStore.getCollectedAgendas() || [];
};

// 页面挂载初始化
onMounted(() => {
  // 加载本地数据
  agendaStore.loadAgendaFromLocalStorage();
  // 初始化收藏列表
  refreshCollectionList();
});

// 取消收藏
const handleCancelCollect = (agendaId) => {
  agendaStore.toggleAgendaCollect(agendaId);
  refreshCollectionList();
  alert('已取消收藏');
};
const goBack = () => {
  router.push({ path: '/mine' });
};
</script>

<style scoped>
.collection-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-header {
  display: flex;
  align-items: center;
  position: relative;
  font-weight: bold;
  color: #333;
  padding: 1em;
  background-color: #fff;
  border-bottom: 0.05em solid #f0f0f0;
}

.back-icon {
  cursor: pointer;
  margin-right: 0.8em;
}

.page-title {
  flex: 1;
  text-align: center;
  margin-right: 1.2em;
}

.page-content {
  padding: 0.8em;
  box-sizing: border-box;
  max-width: 1200px; 
  margin: 0 auto; 
}

.card-common {
  background-color: #fff;
  border-radius: 0.5em;
  padding: 1em;
  box-shadow: 0 0.1em 0.2em rgba(0,0,0,0.05);
  margin-bottom: 0.8em;
}

.empty-tip {
  color: #999;
  text-align: center;
  padding: 2.5em 0;
}

.collection-item {
  padding: 0.8em 0;
  border-bottom: 0.05em solid #f0f0f0;
}

.collection-item:last-child {
  border-bottom: none;
}

.collection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5em;
}

.collection-title {
  font-weight: 500;
  color: #333;
}

.collection-time {
  color: #666;
  background-color: #f5fafe;
  padding: 0.1em 0.4em;
  border-radius: 0.3em;
}

.collection-tags {
  display: flex;
  gap: 0.4em;
  margin-bottom: 0.5em;
  flex-wrap: wrap;
}

.tag-item {
  padding: 0.1em 0.4em;

  background-color: #e6f7ff;
  color: #1989fa;
  border-radius: 0.3em;
}

.cancel-collect {
  margin-top: 0.5em;
  padding: 0.2em 0.5em;
  background-color: #ff4d4f;
  color: #fff;
  border: none;
  border-radius: 0.3em;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.cancel-collect:hover {
  background-color: #ff3333;
}

.mini-btn {
  padding: 0.2em 0.5em;

}
.back-icon {
  cursor: pointer;
  margin-right: 0.8em;

}
</style>