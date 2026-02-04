
import { createRouter,  createWebHashHistory } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import Home from '../views/Home/index.vue'
import Process from '../views/Process/index.vue'
import Detail from '../views/Detail/index.vue' 
import Mine from '../views/Mine/index.vue'
import CollectionPage from '../views/CollectionPage.vue'
import RemarkPage from '../views/RemarkPage.vue'
import SettingPage from '../views/SettingPage.vue'
import CreateMeeting from '../views/CreateMeeting.vue' 
import Login from '../views/Login/index.vue'
import PCLayout from '../layout/PCLayout.vue'

const routes = [
  // 原有路由表不变，无需修改
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/login'
  },
  { 
    path: '/', 
    component: PCLayout,
    meta: { requiresAuth: true },
    children: [
      // 子路由内容不变
      { path: 'home', name: 'Home', component: Home, meta: { tabIndex: 0} },
      { path: 'process', name: 'Process', component: Process, meta: { tabIndex: 1, module: '会议流程' } },
      { path: 'detail', name: 'Detail', component: Detail, meta: { tabIndex: 2, module: '会议详情-日程安排' } },
      { path: 'mine', name: 'Mine', component: Mine, meta: { tabIndex: 3, module: '我的' } },
      { path: 'collection', name: 'Collection', component: CollectionPage },
      { path: 'remark', name: 'Remark', component: RemarkPage },
      { path: 'setting', name: 'Setting', component: SettingPage },
      { path: 'create-meeting', name: 'CreateMeeting', component: CreateMeeting }
    ]
  }
]

const router = createRouter({
  // 已正确使用 createWebHashHistory()
  history: createWebHashHistory(),
  routes
})

// 全局前置守卫不变
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  userStore.initLoginState()
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth) {
    if (userStore.isLogin) {
      next()
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

export default router