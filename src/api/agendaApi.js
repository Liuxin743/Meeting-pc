/**
 * 归档说明：
 * 1. 该文件是会议项目对接后端的 Axios 接口封装模板，封装了议程相关的所有接口请求
 * 2. 当前项目为纯本地数据管理（基于 localStorage + Pinia），无需启用该接口文件，暂作归档
 * 3. 未来对接真实后端时，可取消本文件全量注释，注释掉模拟数据代码，启用真实接口请求即可
 */
/* ------------ 开始：全量注释归档，当前不执行 ------------ */
// import axios from 'axios'

// // 创建Axios实例，配置基础请求信息
// const service = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // 适配Vite环境变量（可在.env文件配置）
//   timeout: 10000, // 请求超时时间
//   headers: {
//     'Content-Type': 'application/json;charset=utf-8'
//   }
// })

// // Axios请求拦截器（可添加token等认证信息）
// service.interceptors.request.use(
//   (config) => {
//     // 示例：添加用户token（从localStorage获取）
//     const token = localStorage.getItem('meeting_token')
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`
//     }
//     return config
//   },
//   (error) => {
//     return Promise.reject(error)
//   }
// )

// // Axios响应拦截器（统一处理响应结果）
// service.interceptors.response.use(
//   (response) => {
//     const res = response.data
//     // 假设后端返回code=200为成功
//     if (res.code !== 200) {
//       return Promise.reject(new Error(res.msg || '请求失败'))
//     }
//     return res
//   },
//   (error) => {
//     return Promise.reject(error)
//   }
// )

// /**
//  * 获取议程列表
//  * @returns {Promise}
//  */
// export function getAgendaList() {
//   // 本地调试：返回模拟数据
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({
//         code: 200,
//         msg: 'success',
//         data: [
//           {
//             id: 1,
//             title: '项目背景与市场分析',
//             time: '14:00-14:20',
//             tags: [],
//             remark: '',
//             isCollected: false,
//             showTagPopover: false
//           },
//           {
//             id: 2,
//             title: '产品需求分析与确认',
//             time: '14:20-14:50',
//             tags: [],
//             remark: '',
//             isCollected: false,
//             showTagPopover: false
//           },
//           {
//             id: 3,
//             title: '技术方案研讨与选型',
//             time: '14:50-15:20',
//             tags: [],
//             remark: '',
//             isCollected: false,
//             showTagPopover: false
//           },
//           {
//             id: 4,
//             title: '任务分配与时间排期',
//             time: '15:20-15:50',
//             tags: [],
//             remark: '',
//             isCollected: false,
//             showTagPopover: false
//           },
//           {
//             id: 5,
//             title: '答疑与后续工作安排',
//             time: '15:50-16:00',
//             tags: [],
//             remark: '',
//             isCollected: false,
//             showTagPopover: false
//           }
//         ]
//       })
//     }, 500)
//   })

//   // 真实后端接口（上线时启用）
//   // return service.get('/agenda/list')
// }

// /**
//  * 保存议程备注
//  * @param {number} agendaId 议程ID
//  * @param {string} remark 备注内容
//  * @returns {Promise}
//  */
// export function saveAgendaRemark(agendaId, remark) {
//   // 本地调试：模拟接口响应
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({
//         code: 200,
//         msg: '备注保存成功'
//       })
//     }, 300)
//   })

//   // 真实后端接口（上线时启用）
//   // return service.post('/agenda/save-remark', { agendaId, remark })
// }

// /**
//  * 保存议程收藏状态
//  * @param {number} agendaId 议程ID
//  * @param {boolean} isCollected 是否收藏
//  * @returns {Promise}
//  */
// export function saveAgendaCollect(agendaId, isCollected) {
//   // 本地调试：模拟接口响应
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({
//         code: 200,
//         msg: isCollected ? '收藏成功' : '取消收藏成功'
//       })
//     }, 300)
//   })

//   // 真实后端接口（上线时启用）
//   // return service.post('/agenda/save-collect', { agendaId, isCollected })
// }

// /**
//  * 保存议程标签
//  * @param {number} agendaId 议程ID
//  * @param {array} tags 标签列表
//  * @returns {Promise}
//  */
// export function saveAgendaTags(agendaId, tags) {
//   // 本地调试：模拟接口响应
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({
//         code: 200,
//         msg: '标签保存成功'
//       })
//     }, 300)
//   })

//   // 真实后端接口（上线时启用）
//   // return service.post('/agenda/save-tags', { agendaId, tags })
// }

// /**
//  * 删除议程
//  * @param {number} agendaId 议程ID
//  * @returns {Promise}
//  */
// export function deleteAgenda(agendaId) {
//   // 本地调试：模拟接口响应
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({
//         code: 200,
//         msg: '议程删除成功'
//       })
//     }, 300)
//   })

//   // 真实后端接口（上线时启用）
//   // return service.delete(`/agenda/delete/${agendaId}`)
// }
/* ------------ 结束：全量注释归档，当前不执行 ------------ */