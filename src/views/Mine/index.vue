<template>
  <div class="mine-view">
    <div class="page-content">
      <!-- 功能入口 -->
      <div class="function-group card-common" style="margin-top: 10px;">
        <div class="function-item" @click="openUserEditDialog">
          <van-icon name="user-o" size="20" color="#1989fa" class="function-icon" />
          <span class="function-title">个人信息编辑</span>
          <van-icon name="arrow-right" size="16" color="#c8c9cc" class="function-arrow" />
        </div>
        <div class="function-item" @click="goToCollection">
          <van-icon name="star" size="20" color="#1989fa" class="function-icon" />
          <span class="function-title">我的收藏</span>
          <van-icon name="arrow-right" size="16" color="#c8c9cc" class="function-arrow" />
        </div>
        <div class="function-item" @click="goToRemark">
          <van-icon name="edit" size="20" color="#1989fa" class="function-icon" />
          <span class="function-title">我的备注</span>
          <van-icon name="arrow-right" size="16" color="#c8c9cc" class="function-arrow" />
        </div>
        <div class="function-item" @click="openBannerEditDialog">
          <van-icon name="photo-o" size="20" color="#1989fa" class="function-icon" />
          <span class="function-title">编辑会议图</span>
          <van-icon name="arrow-right" size="16" color="#c8c9cc" class="function-arrow" />
        </div>
        <div class="function-item" @click="goToSetting">
          <van-icon name="setting" size="20" color="#1989fa" class="function-icon" />
          <span class="function-title">系统设置</span>
          <van-icon name="arrow-right" size="16" color="#c8c9cc" class="function-arrow" />
        </div>
      </div>

      <!-- 一键创建会议按钮 -->
      <div class="btn-group" style="margin: 30px 0; display: flex; justify-content: center;">
        <button class="create-btn main-create-btn" @click="goToCreateMeeting" style="width: 700px;">
          + 一键创建会议
        </button>
      </div>
    </div>

    <!-- 仅保留会议图编辑弹窗 -->
    <div
      class="dialog-mask"
      v-if="bannerEditDialogVisible"
      @click="bannerEditDialogVisible = false"
    >
      <div class="dialog-content dialog-lg" @click.stop>
        <h3 class="dialog-title">编辑会议宣传图</h3>
        <div class="banner-preview">
          <img 
            :src="tempBannerUrl || bannerImageUrl || defaultBannerUrl" 
            alt="宣传图预览" 
            class="preview-img"
          />
        </div>
        <div class="form-item">
          <label class="form-label">上传本地图片：</label>
          <input
            type="file"
            accept="image/*"
            @change="handleBannerUpload"
            class="file-input"
          />
        </div>
        <div class="form-item">
          <label class="form-label">或输入图片URL：</label>
          <input
            class="form-input"
            v-model="bannerUrlInput"
            placeholder="https://example.com/banner.jpg"
          />
        </div>
        <div class="dialog-btn-group">
          <button
            class="dialog-cancel-btn"
            @click="bannerEditDialogVisible = false"
          >取消</button>
          <button class="dialog-confirm-btn" @click="saveBannerImage">
            保存图片
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { inject } from 'vue'

const router = useRouter()

const openUserEditDialog = inject('openUserEditDialog', () => {
  alert('请点击页面顶部右侧头像进行个人信息编辑')
})

// 宣传图相关
const bannerImageUrl = ref(localStorage.getItem('meetingBannerUrl') || '')
const defaultBannerUrl = ref('https://pic1.zhimg.com/v2-ea1f5938445a9fb94d869d76c1d2c2a4_1440w.jpg')
const bannerEditDialogVisible = ref(false)
const tempBannerUrl = ref('')
const bannerUrlInput = ref('')

// 保存会议图数据
const saveBannerToLocalStorage = () => {
  localStorage.setItem('meetingBannerUrl', bannerImageUrl.value)
}

// 宣传图编辑
const openBannerEditDialog = () => {
  tempBannerUrl.value = bannerImageUrl.value
  bannerUrlInput.value = bannerImageUrl.value
  bannerEditDialogVisible.value = true
}

const handleBannerUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    alert('请上传图片格式的文件（JPG/PNG）')
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    alert('图片大小不能超过2MB')
    return
  }
  const reader = new FileReader()
  reader.onload = (event) => {
    tempBannerUrl.value = event.target.result
  }
  reader.readAsDataURL(file)
}

const saveBannerImage = () => {
  if (tempBannerUrl.value) {
    bannerImageUrl.value = tempBannerUrl.value
  } else if (bannerUrlInput.value) {
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w.-]*)*\/?$/
    if (!urlPattern.test(bannerUrlInput.value)) {
      alert('请输入有效的图片URL')
      return
    }
    bannerImageUrl.value = bannerUrlInput.value
  } else {
    bannerImageUrl.value = ''
  }
  saveBannerToLocalStorage()
  bannerEditDialogVisible.value = false
  alert('宣传图保存成功')
}

// 页面跳转
const goToCollection = () => {
  router.push({ path: '/collection' })
}
const goToRemark = () => {
  router.push({ path: '/remark' })
}
const goToSetting = () => {
  router.push({ path: '/setting' })
}
const goToCreateMeeting = () => {
  router.push({ path: '/create-meeting' })
}

// 初始化会议图数据
onMounted(() => {
  const savedBanner = localStorage.getItem('meetingBannerUrl')
  if (savedBanner) bannerImageUrl.value = savedBanner
  
  watch([bannerImageUrl], () => {
    saveBannerToLocalStorage()
  }, { deep: true })
})
</script>

<style scoped>
:root {
  font-size: 20px;
}

.mine-view {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-content {
  padding: 1em;
  width: 100%;
  box-sizing: border-box;
  margin: 0 auto;
}

.card-common {
  background-color: #ffffff;
  border-radius: 0.4em;
  padding: 1em;
  box-shadow: 0 0.1em 0.2em rgba(0,0,0,0.05);
  transition: box-shadow 0.3s ease;
  cursor: default;
}

.card-common:hover {
  box-shadow: 0 0.2em 0.4em rgba(0,0,0,0.08);
}

.function-item {
  display: flex;
  align-items: center;
  padding: 0.8em 0;
  border-bottom: 0.05em solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.function-item:last-child {
  border-bottom: none;
}

.function-item:hover {
  background-color: #f5fafe;
}

.function-icon {
  margin-right: 3em;
}

.function-title {
  flex: 1;
  font-size: 3em;
  color: #333;
}

.function-arrow {
  font-size: 3em;
  color: #c8c9cc;
}

.btn-group {
  display: flex;
  gap: 0.8em;
  width: 100%;
  margin: 0.8em 0;
  justify-content: center;
}

.create-btn {
  background-color: #1989fa;
  color: #fff;
  border: none;
  border-radius: 0.2em;
  padding: 1em 2em;
  font-size: 3em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.2em;
  transition: background-color 0.3s ease;
  width: 700px;
}

.main-create-btn {
  background-color: #1989fa;
}

.create-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.create-btn:hover {
  opacity: 0.9;
}

.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background-color: #ffffff;
  border-radius: 0.5em;
  padding: 1.2em;
  width: 80%;
  max-width: 25em;
}

.dialog-lg {
  width: 90%;
  max-width: 30em;
  max-height: 80vh;
  overflow-y: auto;
}

.dialog-title {
  font-size: 3em;
  font-weight: bold;
  color: #333;
  margin-bottom: 1em;
  text-align: center;
}

.form-item {
  margin-bottom: 1em;
}

.form-label {
  font-size: 3em;
  color: #333;
  margin-bottom: 0.3em;
  display: block;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.5em 0.6em;
  border: 0.05em solid #e5e5e5;
  border-radius: 0.3em;
  font-size: 3em;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  border-color: #1989fa;
  outline: none;
}

.file-input {
  width: 100%;
  padding: 0.5em;
  font-size: 3em;
  color: #666;
}

.dialog-btn-group {
  display: flex;
  gap: 0.8em;
  margin-top: 1.2em;
}

.dialog-confirm-btn {
  flex: 1;
  padding: 0.7em 0;
  background-color: #1989fa;
  color: #ffffff;
  border: none;
  border-radius: 0.3em;
  font-size: 3em;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.dialog-confirm-btn:hover {
  opacity: 0.9;
}

.dialog-cancel-btn {
  flex: 1;
  padding: 0.7em 0;
  background-color: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 0.3em;
  font-size: 3em;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dialog-cancel-btn:hover {
  background-color: #e8e8e8;
}

.banner-preview {
  width: 100%;
  margin-bottom: 1em;
  border-radius: 0.4em;
  overflow: hidden;
  background-color: #f5f5f5;
}

.banner-preview .preview-img {
  width: 100%;
  height: auto;
  max-height: 12em;
  object-fit: cover;
}
</style>