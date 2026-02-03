import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAgendaStore = defineStore('agenda', () => {
  // 议程列表
  const agendaList = ref([]);

  // 生成唯一字符串ID
  const generateUniqueId = () => {
    const timestamp = new Date().getTime().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${randomStr}`; 
  };

  // 切换议程收藏状态
  const toggleAgendaCollect = (agendaId) => {
    const agenda = agendaList.value.find(item => item.id === agendaId);
    if (agenda) {
      agenda.isCollected = !agenda.isCollected;
      localStorage.setItem('agendaList', JSON.stringify(agendaList.value));
    }
  };

  // 获取所有已收藏的议程
  const getCollectedAgendas = () => {
    return agendaList.value.filter(agenda => agenda.isCollected === true) || [];
  };

  // 获取所有带备注的议程
  const getRemarkAgendas = () => {
    return agendaList.value.filter(agenda => agenda.remark && agenda.remark.trim() !== '') || [];
  };

  // 保存议程标签
  const saveAgendaTags = (agendaId, tags) => {
    const agenda = agendaList.value.find(item => item.id === agendaId);
    if (agenda) {
      agenda.tags = tags;
      localStorage.setItem('agendaList', JSON.stringify(agendaList.value));
    }
  };

  // 保存议程备注
  const saveAgendaRemark = (agendaId, remark) => {
    const agenda = agendaList.value.find(item => item.id === agendaId);
    if (agenda) {
      agenda.remark = remark;
      localStorage.setItem('agendaList', JSON.stringify(agendaList.value));
    }
  };

  // 加载本地存储的议程数据
  const loadAgendaFromLocalStorage = () => {
    const savedAgendas = localStorage.getItem('agendaList');
    if (savedAgendas) {
      let parsedAgendas = JSON.parse(savedAgendas);
      // 数据迁移：兼容旧的数字ID、补充缺失字段
      parsedAgendas = parsedAgendas.map(agenda => ({
        ...agenda,
        id: String(agenda.id), // 数字ID转为字符串
        venueId: agenda.venueId || '', // 补充缺失的venueId
        flows: agenda.flows || [], // 确保flows字段存在
        isCollected: agenda.isCollected || false // 补充收藏状态
      }));
      agendaList.value = parsedAgendas;
    }
  };

  // 清除所有议程缓存
  const clearAgendaStorage = () => {
    agendaList.value = [];
    localStorage.removeItem('agendaList');
  };

  // 添加新议程
  const addNewAgenda = (newAgenda) => {
    const agendaId = generateUniqueId();
    let agendaTime = newAgenda.time;
    
    // 格式化时间
    if (agendaTime) {
      agendaTime = agendaTime.includes('T') ? agendaTime.replace('T', ' ') : agendaTime;
    } else {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hour = String(now.getHours()).padStart(2, '0');
      const minute = String(now.getMinutes()).padStart(2, '0');
      agendaTime = `${year}-${month}-${day} ${hour}:${minute}`;
    }

    // 构建完整议程对象
    const agenda = {
      id: agendaId,
      title: newAgenda.title || '未命名议程',
      time: agendaTime,
      venueId: newAgenda.venueId || '', // 直接存储关联会场ID
      tags: newAgenda.tags || [],
      remark: newAgenda.remark || '',
      flows: newAgenda.flows || [], // 流程步骤
      isCollected: false // 默认未收藏
    };

    // 实现议程叠加
    agendaList.value.push(agenda);
    localStorage.setItem('agendaList', JSON.stringify(agendaList.value));
    return agendaId;
  };

  // 更新现有议程
  const updateAgenda = (agendaId, updateData) => {
    const agenda = agendaList.value.find(item => item.id === agendaId);
    if (agenda) {
      // 格式化时间
      if (updateData.time && updateData.time.includes('T')) {
        updateData.time = updateData.time.replace('T', ' ');
      }
      // 合并更新数据
      Object.assign(agenda, updateData);
      // 同步到本地存储
      localStorage.setItem('agendaList', JSON.stringify(agendaList.value));
    }
  };

  // 更新议程流程
  const updateAgendaFlows = (agendaId, newFlows) => {
    const agenda = agendaList.value.find(item => item.id === agendaId);
    if (agenda) {
      agenda.flows.splice(0, agenda.flows.length);
      agenda.flows.push(...(newFlows || []));
      localStorage.setItem('agendaList', JSON.stringify(agendaList.value));
    }
  };

  return {
    agendaList,
    toggleAgendaCollect,
    getCollectedAgendas,
    getRemarkAgendas,
    saveAgendaTags,
    saveAgendaRemark,
    loadAgendaFromLocalStorage,
    clearAgendaStorage,
    addNewAgenda,
    updateAgenda,
    updateAgendaFlows
  };
});