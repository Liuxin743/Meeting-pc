<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
</script>

<style scoped>
#app {
  min-height: 100vh;
  background-color: #f5f5f5;
}
.app-root {
  /* 关键：全局居中，限制最大宽度，适配所有屏幕 */
  min-height: 100vh;
  max-width: 1920px; /* 设计稿宽度 */
  margin: 0 auto;    /* 水平居中 */
  position: relative;
  background-color: #f5f7fa;
}
</style>