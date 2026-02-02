
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/userStore' // 导入用户仓库
import Home from '../views/Home/index.vue'
import Process from '../views/Process/index.vue'
import Detail from '../views/Detail/index.vue' 
import Mine from '../views/Mine/index.vue'
import CollectionPage from '../views/CollectionPage.vue'
import RemarkPage from '../views/RemarkPage.vue'
import SettingPage from '../views/SettingPage.vue'
import CreateMeeting from '../views/CreateMeeting.vue' 
import Login from '../views/Login/index.vue' // 导入登录组件
import PCLayout from '../layout/PCLayout.vue'

const routes = [
  // 1. 登录页路由（无需布局，直接访问）
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false } // 无需登录即可访问
  },
  // 2. 根路径重定向（默认跳转到登录页）
  {
    path: '/',
    redirect: '/login'
  },
  // 3. 需登录的布局路由（所有子路由都需要登录）
  { 
    path: '/', 
    component: PCLayout,
    meta: { requiresAuth: true }, // 需要登录才能访问
    children: [
      {
        path: 'home',
        name: 'Home',
        component: Home,
        meta: { tabIndex: 0}
      },
      {
        path: 'process',
        name: 'Process',
        component: Process,
        meta: { tabIndex: 1, module: '会议流程' }
      },
      {
        path: 'detail',
        name: 'Detail',
        component: Detail,
        meta: { tabIndex: 2, module: '会议详情-日程安排' }
      },
      {
        path: 'mine',
        name: 'Mine',
        component: Mine,
        meta: { tabIndex: 3, module: '我的' }
      },
      {
        path: 'collection',
        name: 'Collection',
        component: CollectionPage
      },
      {
        path: 'remark',
        name: 'Remark',
        component: RemarkPage
      },
      {
        path: 'setting',
        name: 'Setting',
        component: SettingPage
      },
      {
        path: 'create-meeting',
        name: 'CreateMeeting',
        component: CreateMeeting
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 4. 全局前置守卫：拦截未登录访问
router.beforeEach((to, from, next) => {
  // 初始化用户仓库
  const userStore = useUserStore()
  // 恢复页面刷新后的登录状态
  userStore.initLoginState()

  // 判断当前路由是否需要登录
  const requiresAuth = to.meta.requiresAuth !== false // 默认为需要登录

  if (requiresAuth) {
    // 需要登录：判断是否已登录
    if (userStore.isLogin) {
      // 已登录，放行
      next()
    } else {
      // 未登录，跳转到登录页
      next('/login')
    }
  } else {
    // 无需登录，直接放行（如登录页）
    next()
  }
})

export default router