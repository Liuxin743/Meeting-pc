import { createApp } from 'vue'
import App from './App.vue'

import router from './router'

// 2. 引入 Pinia（状态管理）
import { createPinia } from 'pinia'

// 3. 引入 Vant 组件库
import { 
  ConfigProvider, Tabbar, TabbarItem, 
  Button, Popover, Checkbox, CheckboxGroup,
  Dialog, Field, Tag, Cell, CellGroup,
  CountDown, NoticeBar, Card, Empty, Calendar, List,
  SwipeCell, Toast, Icon,Swipe, SwipeItem,Uploader
} from 'vant'
import 'vant/lib/index.css' // Vant 全局样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css' // Element Plus 全局样式
import * as ElementPlusIconsVue from '@element-plus/icons-vue' // Element Plus 图标库

// 5. 创建 Vue 应用实例
const app = createApp(App)

// 6. 全局注册 Element Plus 图标（遍历所有图标组件并注册）
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 7. 全局注册 Vant 组件
app.use(ConfigProvider)
app.use(Tabbar)
app.use(TabbarItem)
app.use(Button)
app.use(Popover)
app.use(Checkbox)
app.use(CheckboxGroup)
app.use(Dialog)
app.use(Field)
app.use(Tag)
app.use(Cell)
app.use(CellGroup)
app.use(CountDown)
app.use(NoticeBar)
app.use(Card)
app.use(Empty)
app.use(Calendar)
app.use(List)
app.use(SwipeCell)
app.use(Toast)
app.use(Icon)
app.use(Swipe) 
app.use(SwipeItem) 
app.use(Uploader)

// 8. 全局注册 Element-Plus（全局可用）
app.use(ElementPlus)

// 9. 挂载 Pinia 和 路由（使项目支持状态管理和路由跳转）
app.use(createPinia())
app.use(router)

// 10. 挂载 Vue 应用到 DOM 节点（public/index.html 中的 <div id="app"></div>）
app.mount('#app')