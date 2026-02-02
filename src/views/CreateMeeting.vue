<template>
  <div class="create-meeting-view">
    <div class="page-content">
      <!-- 一键创建会议 按钮 -->
      <div class="btn-group" style="margin: 10px 0; display: flex; gap: 10px;">
        <button class="create-btn venue-operation-btn" @click="openCreateDialog" style="flex: 1;">
          + 一键创建会议
        </button>
      </div>

      <!-- 我创建的会场列表 -->
      <div class="venue-card card-common" style="margin-top: 10px;">
        <!-- 调整：将按钮移到标题旁（左侧红框），去掉space-between，改用gap控制间距 -->
        <div style="display: flex; align-items: center; gap: 1em;">
          <h3 class="card-title">我创建的会场</h3>
          <button class="create-btn venue-operation-btn" style="background-color: #4cd964;" @click="openOnlyVenueDialog">
            + 创建会场
          </button>
        </div>
        <div class="empty-tip" v-if="venues.length === 0">
          暂无创建的会场，点击「创建会议」开始
        </div>
        <div class="venue-list" v-else>
          <div class="venue-item" v-for="venue in venues" :key="venue.id">
            <div class="venue-content" :style="{ borderLeft: `4px solid ${venue.color}` }">
              <!-- 标题+类型标签 -->
              <div class="venue-title-wrap">
                <div class="venue-title">{{ venue.name }}</div>
                <span class="venue-type-tag" :style="{ backgroundColor: venue.color }">{{ venue.type }}</span>
              </div>
              
              <!-- 会议详情 + 操作按钮 -->
              <div class="venue-detail-row">
                <div class="venue-detail">
                  <div class="venue-label">会议时间：{{ formatAgendaTime(venue.time) }}</div>
                  <div class="venue-label">会议地址：{{ venue.address }}</div>
                  <div class="venue-label">关联议程：{{ getAgendaCountByVenueId(venue.id) }} 个</div>
                </div>
                <!-- 操作按钮 -->
                <div class="venue-actions-left">
                  <button class="btn-edit mini-btn" @click="openEditVenueDialog(venue)">编辑</button>
                  <button class="btn-edit mini-btn" style="background-color: #ff9500;" @click="openOnlyAgendaDialog(venue.id)">创建议程</button>
                  <button class="btn-danger mini-btn" @click="deleteVenue(venue.id)">删除</button>
                </div>
              </div>
              
              <!--点击分享ID自动复制 -->
              <div class="share-id-row">
                <span class="share-id-label">分享ID：</span>
                <span 
                  class="share-id" 
                  @click="copyShareId(venue.shareId)"
                  style="cursor: pointer; user-select: all;"
                >
                  {{ venue.shareId }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 我的议程列表 -->
      <div class="agenda-card card-common" style="margin-top: 10px;">
        <h3 class="card-title">我的议程</h3>
        <div class="empty-tip" v-if="agendas.length === 0">
          暂无创建的议程，先创建会议再创建议程
        </div>
        <div class="agenda-list" v-else>
          <div class="agenda-item" v-for="agenda in agendas" :key="agenda.id">
            <div class="agenda-content">
              <div class="agenda-title">{{ agenda.title }}</div>
              <div class="agenda-label">所属会场：{{ getVenueNameById(agenda.venueId) }}</div>
              <div class="agenda-label">议程时间：{{ formatAgendaTime(agenda.time) }}</div>
              <div class="agenda-label" v-if="agenda.flows && agenda.flows.length > 0">
                流程数量：{{ agenda.flows.length }} 步
              </div>
              <div class="agenda-label" v-else>
                流程数量：0 步（暂无流程）
              </div>
            </div>
            <div class="agenda-actions">
              <button class="btn-edit mini-btn" @click="openEditFlowDialog(agenda)">
                编辑流程
              </button>
              <button class="btn-danger mini-btn" @click="deleteAgenda(agenda.id)">
                删除
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 我加入的会场&议程 -->
      <div class="venue-card card-common" style="margin-top: 10px;">
        <!-- 调整：将按钮移到标题旁（左侧红框），去掉space-between，改用gap控制间距 -->
        <div style="display: flex; align-items: center; gap: 1em;">
          <h3 class="card-title">加入的会场及议程</h3>
          <button class="create-btn join-btn venue-operation-btn" @click="openJoinVenueDialog" style="background-color: #4cd964;">
            + 加入会场
          </button>
        </div>
        <div class="empty-tip" v-if="joinedVenueAgendas.length === 0">
          暂无加入的会场，点击[创建会场]输入ID加入
        </div>
        <div class="joined-content" v-else>
          <div v-for="item in joinedVenueAgendas" :key="item.venue.id">
            <div class="venue-item">
              <div class="venue-content" :style="{ borderLeft: `4px solid ${item.venue.color}` }">
                <div class="venue-title-wrap">
                  <div class="venue-title">{{ item.venue.name }}</div>
                  <span class="venue-type-tag" :style="{ backgroundColor: item.venue.color }">{{ item.venue.type }}</span>
                  <span class="creator-tag">创建者：{{ item.venue.creatorName || '未知' }}</span>
                </div>
                <div class="venue-detail">
                  <div class="venue-label">会议时间：{{ formatAgendaTime(item.venue.time) }}</div>
                  <div class="venue-label">会议地址：{{ item.venue.address }}</div>
                  <div class="venue-label">关联议程：{{ item.agendas.length }} 个</div>
                </div>
                <div class="venue-actions-right">
                  <button class="btn-danger mini-btn" @click="quitVenue(item.venue.id)">退出</button>
                </div>
              </div>
            </div>
            <div class="agenda-list" style="margin-left: 12px; margin-top: 8px; border-left: 1px dashed #f0f0f0; padding-left: 12px;">
              <div v-if="item.agendas.length === 0" class="empty-tip" style="padding: 10px 0; margin: 0;">
                该会场暂无关联议程
              </div>
              <div class="agenda-item" v-for="agenda in item.agendas" :key="agenda.id">
                <div class="agenda-content">
                  <div class="agenda-title">{{ agenda.title }}</div>
                  <div class="agenda-label">议程时间：{{ formatAgendaTime(agenda.time) }}</div>
                  <div class="agenda-label" v-if="agenda.flows && agenda.flows.length > 0">
                    流程数量：{{ agenda.flows.length }} 步
                  </div>
                  <div class="agenda-label" v-else>
                    流程数量：0 步（暂无流程）
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑会场弹窗 -->
    <div
      class="dialog-mask"
      v-if="createVenueDialogVisible"
      @click="createVenueDialogVisible = false"
    >
      <div class="dialog-content dialog-lg" @click.stop>
        <h3 class="dialog-title">{{ isEditVenue ? '编辑会场' : '创建新会场' }}</h3>
        <div class="form-item">
          <label class="form-label">会场名称：</label>
          <input
            class="form-input"
            v-model="newVenue.name"
            placeholder="如：技术主会场、运营分会场"
          />
        </div>
        <div class="form-item">
          <label class="form-label">会场类型：</label>
          <select class="form-input" v-model="newVenue.type">
            <option value="主会场">主会场</option>
            <option value="分会场">分会场</option>
          </select>
        </div>
        <div class="form-item">
          <label class="form-label">会议时间：</label>
          <input
            class="form-input"
            type="datetime-local"
            v-model="newVenue.time"
          />
        </div>
        <div class="form-item">
          <label class="form-label">会议地址：</label>
          <input
            class="form-input"
            v-model="newVenue.address"
            placeholder="如：国际会议中心 一号宴会厅"
          />
        </div>
        <div class="form-item">
          <label class="form-label">主题色：</label>
          <input
            class="form-input color-input"
            type="color"
            v-model="newVenue.color"
          />
        </div>
        <div class="dialog-btn-group">
          <button
            class="dialog-cancel-btn"
            @click="createVenueDialogVisible = false"
          >取消</button>
          <button class="dialog-confirm-btn" @click="isEditVenue ? saveEditVenue() : createVenue()">
            {{ isEditVenue ? '保存修改' : '确认创建' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 创建会议弹窗-->
    <div
      class="dialog-mask"
      v-if="createDialogVisible"
      @click="createDialogVisible = false"
    >
      <div class="dialog-content dialog-lg" @click.stop>
        <h3 class="dialog-title">创建新会议</h3>
        <div class="create-step">
          <h4 class="step-title">1. 会场基本信息</h4>
          <div class="form-item">
            <label class="form-label">会场名称：</label>
            <input
              class="form-input"
              v-model="newMeeting.venue.name"
              placeholder="如：技术主会场、运营分会场"
            />
          </div>
          <div class="form-item">
            <label class="form-label">会场类型：</label>
            <select class="form-input" v-model="newMeeting.venue.type">
              <option value="主会场">主会场</option>
              <option value="分会场">分会场</option>
            </select>
          </div>
          <div class="form-item">
            <label class="form-label">会议时间：</label>
            <input
              class="form-input"
              type="datetime-local"
              v-model="newMeeting.venue.time"
            />
          </div>
          <div class="form-item">
            <label class="form-label">会议地址：</label>
            <input
              class="form-input"
              v-model="newMeeting.venue.address"
              placeholder="如：国际会议中心 一号宴会厅"
            />
          </div>
          <div class="form-item">
            <label class="form-label">主题色：</label>
            <input
              class="form-input color-input"
              type="color"
              v-model="newMeeting.venue.color"
            />
          </div>
        </div>
        <div class="create-step" style="margin-top: 20px;">
          <h4 class="step-title">2. 议程及流程信息</h4>
          <div class="form-item">
            <label class="form-label">议程标题：</label>
            <input
              class="form-input"
              v-model="newMeeting.agenda.title"
              placeholder="请输入议程标题（如：项目讨论会议）"
            />
          </div>
          <div class="form-item">
            <label class="form-label">议程时间：</label>
            <input
              class="form-input"
              type="datetime-local"
              v-model="newMeeting.agenda.time"
            />
          </div>
          <div class="form-item flow-form-item">
            <label class="form-label">会议流程：</label>
            <div class="flow-add-btn" @click="addNewFlowStep">
              <van-icon name="plus" size="16" color="#1989fa" />
              <span>添加流程步骤</span>
            </div>
            <div class="flow-step-list" v-if="newMeeting.agenda.flows.length > 0">
              <div class="flow-step-item" v-for="(step, index) in newMeeting.agenda.flows" :key="index">
                <div class="step-header">
                  <span class="step-num">步骤 {{ index + 1 }}</span>
                  <button class="step-del-btn" @click="deleteFlowStep(index)">
                    <van-icon name="cross" size="14" color="#ff4d4f" />
                  </button>
                </div>
                <div class="step-form-content">
                  <div class="step-form-item">
                    <label class="step-form-label">流程标题：</label>
                    <input
                      class="form-input step-input"
                      v-model="step.title"
                      placeholder="请输入流程标题（如：开场致辞）"
                    />
                  </div>
                  <div class="step-form-item">
                    <label class="step-form-label">流程时间：</label>
                    <input
                      class="form-input step-input"
                      type="datetime-local"
                      v-model="step.time"
                    />
                  </div>
                  <div class="step-form-item">
                    <label class="step-form-label">流程描述：</label>
                    <textarea
                      class="form-input step-textarea"
                      v-model="step.desc"
                      placeholder="请输入流程详细描述..."
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="dialog-btn-group">
            <button
              class="dialog-cancel-btn"
              @click="createDialogVisible = false"
            >取消</button>
            <button class="dialog-confirm-btn" @click="handleCreateMeeting">
              确认创建会议
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 仅创建会场弹窗 -->
    <div
      class="dialog-mask"
      v-if="onlyVenueDialogVisible"
      @click="onlyVenueDialogVisible = false"
    >
      <div class="dialog-content dialog-lg" @click.stop>
        <h3 class="dialog-title">创建新会场</h3>
        <div class="form-item">
          <label class="form-label">会场名称：</label>
          <input
            class="form-input"
            v-model="onlyVenueForm.name"
            placeholder="如：技术主会场、运营分会场"
          />
        </div>
        <div class="form-item">
          <label class="form-label">会场类型：</label>
          <select class="form-input" v-model="onlyVenueForm.type">
            <option value="主会场">主会场</option>
            <option value="分会场">分会场</option>
          </select>
        </div>
        <div class="form-item">
          <label class="form-label">会议时间：</label>
          <input
            class="form-input"
            type="datetime-local"
            v-model="onlyVenueForm.time"
          />
        </div>
        <div class="form-item">
          <label class="form-label">会议地址：</label>
          <input
            class="form-input"
            v-model="onlyVenueForm.address"
            placeholder="如：国际会议中心 一号宴会厅"
          />
        </div>
        <div class="form-item">
          <label class="form-label">主题色：</label>
          <input
            class="form-input color-input"
            type="color"
            v-model="onlyVenueForm.color"
          />
        </div>
        <div class="dialog-btn-group">
          <button
            class="dialog-cancel-btn"
            @click="onlyVenueDialogVisible = false"
          >取消</button>
          <button class="dialog-confirm-btn" @click="handleCreateOnlyVenue">
            确认创建会场
          </button>
        </div>
      </div>
    </div>

    <!-- 仅创建议程弹窗 -->
    <div
      class="dialog-mask"
      v-if="onlyAgendaDialogVisible"
      @click="onlyAgendaDialogVisible = false"
    >
      <div class="dialog-content dialog-lg" @click.stop>
        <h3 class="dialog-title">为会场新增议程</h3>
        <div class="form-item">
          <label class="form-label">所属会场：</label>
          <select class="form-input" v-model="onlyAgendaForm.venueId">
            <option value="">请选择会场</option>
            <option v-for="venue in venues" :key="venue.id" :value="venue.id">
              {{ venue.name }} ({{ venue.type }})
            </option>
          </select>
        </div>
        <div class="form-item">
          <label class="form-label">议程标题：</label>
          <input
            class="form-input"
            v-model="onlyAgendaForm.title"
            placeholder="请输入议程标题（如：项目讨论会）"
          />
        </div>
        <div class="form-item">
          <label class="form-label">议程时间：</label>
          <input
            class="form-input"
            type="datetime-local"
            v-model="onlyAgendaForm.time"
          />
        </div>
        <div class="form-item flow-form-item">
          <label class="form-label">会议流程：</label>
          <div class="flow-add-btn" @click="addNewOnlyAgendaFlowStep">
            <van-icon name="plus" size="16" color="#1989fa" />
            <span>添加流程步骤</span>
          </div>
          <div class="flow-step-list" v-if="onlyAgendaForm.flows.length > 0">
            <div class="flow-step-item" v-for="(step, index) in onlyAgendaForm.flows" :key="index">
              <div class="step-header">
                <span class="step-num">步骤 {{ index + 1 }}</span>
                <button class="step-del-btn" @click="deleteOnlyAgendaFlowStep(index)">
                  <van-icon name="cross" size="14" color="#ff4d4f" />
                </button>
              </div>
              <div class="step-form-content">
                <div class="step-form-item">
                  <label class="step-form-label">流程标题：</label>
                  <input
                    class="form-input step-input"
                    v-model="step.title"
                    placeholder="请输入流程标题（如：开场致辞）"
                  />
                </div>
                <div class="step-form-item">
                  <label class="step-form-label">流程时间：</label>
                  <input
                    class="form-input step-input"
                    type="datetime-local"
                    v-model="step.time"
                  />
                </div>
                <div class="step-form-item">
                  <label class="step-form-label">流程描述：</label>
                  <textarea
                    class="form-input step-textarea"
                    v-model="step.desc"
                    placeholder="请输入流程详细描述..."
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="dialog-btn-group">
          <button
            class="dialog-cancel-btn"
            @click="onlyAgendaDialogVisible = false"
          >取消</button>
          <button class="dialog-confirm-btn" @click="handleCreateOnlyAgenda">
            确认创建议程
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑流程弹窗 -->
    <div
      class="dialog-mask"
      v-if="editFlowDialogVisible"
      @click="editFlowDialogVisible = false"
    >
      <div class="dialog-content dialog-lg" @click.stop>
        <h3 class="dialog-title">编辑 {{ currentEditAgenda.title }} 流程</h3>
        <div class="form-item flow-form-item">
          <label class="form-label">会议流程：</label>
          <div class="flow-add-btn" @click="addNewEditFlowStep">
            <van-icon name="plus" size="16" color="#1989fa" />
            <span>添加流程步骤</span>
          </div>
          <div class="flow-step-list" v-if="currentEditAgenda.flows.length > 0">
            <div class="flow-step-item" v-for="(step, index) in currentEditAgenda.flows" :key="index">
              <div class="step-header">
                <span class="step-num">步骤 {{ index + 1 }}</span>
                <button class="step-del-btn" @click="deleteEditFlowStep(index)">
                  <van-icon name="cross" size="14" color="#ff4d4f" />
                </button>
              </div>
              <div class="step-form-content">
                <div class="step-form-item">
                  <label class="step-form-label">流程标题：</label>
                  <input
                    class="form-input step-input"
                    v-model="step.title"
                    placeholder="请输入流程标题（如：开场致辞）"
                  />
                </div>
                <div class="step-form-item">
                  <label class="step-form-label">流程时间：</label>
                  <input
                    class="form-input step-input"
                    type="datetime-local"
                    v-model="step.time"
                  />
                </div>
                <div class="step-form-item">
                  <label class="step-form-label">流程描述：</label>
                  <textarea
                    class="form-input step-textarea"
                    v-model="step.desc"
                    placeholder="请输入流程详细描述..."
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="dialog-btn-group">
          <button
            class="dialog-cancel-btn"
            @click="editFlowDialogVisible = false"
          >取消</button>
          <button class="dialog-confirm-btn" @click="handleSaveEditFlow">
            保存流程
          </button>
        </div>
      </div>
    </div>

    <!-- 加入会场弹窗 -->
    <div
      class="dialog-mask"
      v-if="joinVenueDialogVisible"
      @click="joinVenueDialogVisible = false"
    >
      <div class="dialog-content dialog-lg" @click.stop>
        <h3 class="dialog-title">加入会场</h3>
        <div class="form-item">
          <label class="form-label">输入会场分享ID：</label>
          <input
            class="form-input"
            v-model="joinVenueForm.shareId"
            placeholder="请输入6位会场分享ID"
            maxlength="6"
          />
        </div>
        <div class="form-tip">
          分享ID可从会场创建者处获取，仅支持6位字符
        </div>
        <div class="dialog-btn-group">
          <button
            class="dialog-cancel-btn"
            @click="joinVenueDialogVisible = false"
          >取消</button>
          <button class="dialog-confirm-btn" @click="handleJoinVenue">
            确认加入
          </button>
        </div>
      </div>
    </div>

    <!-- 复制成功提示 -->
    <div class="toast-mask" v-if="copyToastVisible">
      <div class="toast-content">
        ✅ 分享ID已复制！
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAgendaStore } from '../stores/agendaStore'

const router = useRouter()
const agendaStore = useAgendaStore()

// 会场相关数据
const venues = ref(JSON.parse(localStorage.getItem('customVenues')) || [])
const joinedVenues = ref(JSON.parse(localStorage.getItem('joinedVenues')) || [])
const createVenueDialogVisible = ref(false)
const isEditVenue = ref(false)
const newVenue = reactive({
  id: '',
  name: '',
  type: '主会场',
  time: '',
  address: '',
  color: '#1989fa'
})

// 合并后的会议数据
const createDialogVisible = ref(false)
const newMeeting = reactive({
  venue: {
    id: '',
    name: '',
    type: '主会场',
    time: '',
    address: '',
    color: '#1989fa'
  },
  agenda: {
    title: "",
    time: "",
    flows: []
  }
})

// 创建会场相关
const onlyVenueDialogVisible = ref(false)
const onlyVenueForm = reactive({
  id: '',
  name: '',
  type: '主会场',
  time: '',
  address: '',
  color: '#1989fa'
})

// 创建议程相关
const onlyAgendaDialogVisible = ref(false)
const onlyAgendaForm = reactive({
  venueId: '',
  title: "",
  time: "",
  flows: []
})

// 议程相关
const agendas = computed(() => agendaStore.agendaList)

// 合并加入的会场与议程
const joinedVenueAgendas = computed(() => {
  return joinedVenues.value.map(venue => {
    const venueAgendas = agendaStore.agendaList.filter(agenda => agenda.venueId === venue.id)
    return {
      venue: venue,
      agendas: venueAgendas
    }
  })
})

// 编辑流程弹窗相关
const editFlowDialogVisible = ref(false)
const currentEditAgenda = reactive({
  id: '',
  title: '',
  flows: []
})

// 加入会场相关
const joinVenueDialogVisible = ref(false)
const joinVenueForm = reactive({
  shareId: ''
})
const copyToastVisible = ref(false)

// 生成唯一ID
const generateUniqueId = () => {
  const timestamp = new Date().getTime().toString(36)
  const randomNum = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${randomNum}`
}

// 生成6位分享ID
const generateShareId = () => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let shareId = ''
  for (let i = 0; i < 6; i++) {
    shareId += chars[Math.floor(Math.random() * chars.length)]
  }
  return shareId
}

// 格式化当前时间
const formatCurrentDateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hour}:${minute}`
}

// 格式化时间显示
const formatAgendaTime = (datetimeStr) => {
  if (!datetimeStr) return '未设置'
  const formatStr = datetimeStr.includes('T') ? datetimeStr.replace('T', ' ') : datetimeStr
  const date = new Date(formatStr)
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 保存非议程数据
const saveToLocalStorage = () => {
  localStorage.setItem('customVenues', JSON.stringify(venues.value))
  localStorage.setItem('joinedVenues', JSON.stringify(joinedVenues.value))
}

// 会场操作方法
const openEditVenueDialog = (venue) => {
  newVenue.id = venue.id
  newVenue.name = venue.name
  newVenue.type = venue.type
  newVenue.time = venue.time.includes(' ') ? venue.time.replace(' ', 'T') : venue.time
  newVenue.address = venue.address
  newVenue.color = venue.color
  newVenue.shareId = venue.shareId
  isEditVenue.value = true
  createVenueDialogVisible.value = true
}

const createVenue = () => {
  if (!newVenue.name || !newVenue.time || !newVenue.address) {
    alert('请填写必填字段')
    return
  }
  newVenue.id = generateUniqueId()
  newVenue.shareId = generateShareId()
  newVenue.creatorName = localStorage.getItem('userName') || '未知用户'
  venues.value.push({ ...newVenue })
  saveToLocalStorage()
  createVenueDialogVisible.value = false
  alert('会场创建成功，分享ID：' + newVenue.shareId)
}

const saveEditVenue = () => {
  if (!newVenue.name || !newVenue.time || !newVenue.address) {
    alert('请填写必填字段')
    return
  }
  const index = venues.value.findIndex(v => v.id === newVenue.id)
  if (index > -1) {
    venues.value[index] = { ...newVenue }
    saveToLocalStorage()
    createVenueDialogVisible.value = false
    alert('会场修改成功')
  }
}

const deleteVenue = (venueId) => {
  if (!confirm('确定删除该会场？关联的所有议程也会被删除')) return
  venues.value = venues.value.filter(v => v.id !== venueId)
  agendaStore.agendaList = agendaStore.agendaList.filter(a => a.venueId !== venueId)
  joinedVenues.value = joinedVenues.value.filter(v => v.id !== venueId)
  localStorage.setItem('agendaList', JSON.stringify(agendaStore.agendaList))
  saveToLocalStorage()
  alert('会场及关联议程已删除')
}

// 仅创建会场弹窗
const openOnlyVenueDialog = () => {
  onlyVenueForm.id = generateUniqueId()
  onlyVenueForm.name = ''
  onlyVenueForm.type = '主会场'
  onlyVenueForm.time = formatCurrentDateTime()
  onlyVenueForm.address = ''
  onlyVenueForm.color = '#1989fa'
  onlyVenueForm.creatorName = localStorage.getItem('userName') || '未知用户'
  onlyVenueForm.shareId = generateShareId()
  onlyVenueDialogVisible.value = true
}

const handleCreateOnlyVenue = () => {
  if (!onlyVenueForm.name || !onlyVenueForm.time || !onlyVenueForm.address) {
    return alert("请填写完整的会场信息")
  }
  venues.value.push({ ...onlyVenueForm })
  saveToLocalStorage()
  onlyVenueDialogVisible.value = false
  alert("会场创建成功，分享ID：" + onlyVenueForm.shareId)
}

// 仅创建议程弹窗
const openOnlyAgendaDialog = (preSelectedVenueId = '') => {
  onlyAgendaForm.venueId = preSelectedVenueId || ''
  onlyAgendaForm.title = ""
  onlyAgendaForm.time = formatCurrentDateTime()
  onlyAgendaForm.flows = []
  onlyAgendaDialogVisible.value = true
}

const addNewOnlyAgendaFlowStep = () => {
  const newFlowStep = { title: "", time: formatCurrentDateTime(), desc: "" }
  onlyAgendaForm.flows.push(newFlowStep)
}

const deleteOnlyAgendaFlowStep = (index) => {
  if (confirm('确定要删除该流程步骤吗？删除后不可恢复')) {
    onlyAgendaForm.flows.splice(index, 1)
  }
}

const handleCreateOnlyAgenda = () => {
  if (!onlyAgendaForm.venueId) {
    return alert("请选择所属会场")
  }
  if (!onlyAgendaForm.title.trim()) {
    return alert("请输入议程标题")
  }
  const formattedFlows = onlyAgendaForm.flows.map(step => ({
    ...step,
    time: step.time ? step.time.replace('T', ' ') : ''
  }))
  agendaStore.addNewAgenda({
    id: generateUniqueId(),
    title: onlyAgendaForm.title.trim(),
    time: onlyAgendaForm.time,
    venueId: onlyAgendaForm.venueId,
    flows: formattedFlows
  })
  onlyAgendaDialogVisible.value = false
  alert("议程创建成功")
}

// 会场ID获取会场名称
const getVenueNameById = (venueId) => {
  const venue = venues.value.find(v => v.id === venueId)
  if (venue) return venue.name
  const joinedVenue = joinedVenues.value.find(v => v.id === venueId)
  return joinedVenue ? joinedVenue.name : '未知会场'
}

// 会场ID获取关联议程数量
const getAgendaCountByVenueId = (venueId) => {
  return agendaStore.agendaList.filter(a => a.venueId === venueId).length
}

// 打开合并后的创建弹窗
const openCreateDialog = () => {
  newMeeting.venue.id = generateUniqueId()
  newMeeting.venue.name = ''
  newMeeting.venue.type = '主会场'
  newMeeting.venue.time = formatCurrentDateTime()
  newMeeting.venue.address = ''
  newMeeting.venue.color = '#1989fa'
  newMeeting.venue.creatorName = localStorage.getItem('userName') || '未知用户'
  newMeeting.venue.shareId = generateShareId()
  newMeeting.agenda.title = ""
  newMeeting.agenda.time = formatCurrentDateTime()
  newMeeting.agenda.flows = []
  createDialogVisible.value = true
}

const addNewFlowStep = () => {
  const newFlowStep = { title: "", time: formatCurrentDateTime(), desc: "" }
  newMeeting.agenda.flows.push(newFlowStep)
}

const deleteFlowStep = (index) => {
  if (confirm('确定要删除该流程步骤吗？删除后不可恢复')) {
    newMeeting.agenda.flows.splice(index, 1)
  }
}

const handleCreateMeeting = () => {
  if (!newMeeting.venue.name || !newMeeting.venue.time || !newMeeting.venue.address) {
    return alert("请填写完整的会场信息")
  }
  if (!newMeeting.agenda.title.trim()) {
    return alert("请输入议程标题")
  }
  venues.value.push({ ...newMeeting.venue })
  saveToLocalStorage()
  const formattedFlows = newMeeting.agenda.flows.map(step => ({
    ...step,
    time: step.time ? step.time.replace('T', ' ') : ''
  }))
  agendaStore.addNewAgenda({
    id: generateUniqueId(),
    title: newMeeting.agenda.title.trim(),
    time: newMeeting.agenda.time,
    venueId: newMeeting.venue.id,
    flows: formattedFlows
  })
  createDialogVisible.value = false
  alert("会议流程创建成功，分享ID：" + newMeeting.venue.shareId)
}

// 删除议程
const deleteAgenda = (agendaId) => {
  if (!confirm('确定删除该议程？关联的所有流程步骤也会被删除')) return
  agendaStore.agendaList = agendaStore.agendaList.filter(a => a.id !== agendaId)
  localStorage.setItem('agendaList', JSON.stringify(agendaStore.agendaList))
  alert('议程已删除')
}

// 编辑流程方法
const openEditFlowDialog = (agenda) => {
  currentEditAgenda.id = agenda.id
  currentEditAgenda.title = agenda.title
  currentEditAgenda.flows = JSON.parse(JSON.stringify(agenda.flows || []))
  currentEditAgenda.flows.forEach(step => {
    if (step.time && step.time.includes(' ')) {
      step.time = step.time.replace(' ', 'T')
    }
  })
  editFlowDialogVisible.value = true
}

const addNewEditFlowStep = () => {
  const newFlowStep = { title: "", time: formatCurrentDateTime(), desc: "" }
  currentEditAgenda.flows.push(newFlowStep)
}

const deleteEditFlowStep = (index) => {
  if (confirm('确定要删除该流程步骤吗？删除后不可恢复')) {
    currentEditAgenda.flows.splice(index, 1)
  }
}

const handleSaveEditFlow = () => {
  if (!currentEditAgenda.id) {
    alert('议程ID异常，无法保存流程')
    return
  }
  const formattedFlows = currentEditAgenda.flows.map(step => ({
    ...step,
    time: step.time ? step.time.replace('T', ' ') : ''
  }))
  const agenda = agendaStore.agendaList.find(a => a.id === currentEditAgenda.id)
  if (agenda) {
    agenda.flows.splice(0, agenda.flows.length)
    agenda.flows.push(...formattedFlows)
    localStorage.setItem('agendaList', JSON.stringify(agendaStore.agendaList))
  }
  editFlowDialogVisible.value = false
  alert('议程流程保存成功')
}

// 加入会场
const openJoinVenueDialog = () => {
  joinVenueForm.shareId = ''
  joinVenueDialogVisible.value = true
}

const handleJoinVenue = () => {
  const shareId = joinVenueForm.shareId.trim()
  if (!shareId || shareId.length !== 6) {
    alert('请输入有效的6位分享ID')
    return
  }
  const targetVenue = venues.value.find(v => v.shareId === shareId)
  if (!targetVenue) {
    alert('未找到该会场，请检查分享ID是否正确')
    return
  }
  const isAlreadyJoined = joinedVenues.value.some(v => v.id === targetVenue.id)
  if (isAlreadyJoined) {
    alert('你已加入该会场，无需重复加入')
    joinVenueDialogVisible.value = false
    return
  }
  joinedVenues.value.push(JSON.parse(JSON.stringify(targetVenue)))
  saveToLocalStorage()
  joinVenueDialogVisible.value = false
  alert(`成功加入会场：${targetVenue.name}（已自动同步该会场的议程）`)
}

// 退出会场
const quitVenue = (venueId) => {
  if (!confirm('确定退出该会场？退出后将无法查看其关联议程')) return
  joinedVenues.value = joinedVenues.value.filter(v => v.id !== venueId)
  saveToLocalStorage()
  alert('已成功退出该会场')
}

// 点击分享ID自动复制
const copyShareId = (shareId) => {
  navigator.clipboard.writeText(shareId).then(() => {
    copyToastVisible.value = true
    setTimeout(() => {
      copyToastVisible.value = false
    }, 1500)
  }).catch(() => {
    alert('复制失败，请手动复制')
  })
}

// 初始化数据
onMounted(() => {
  const savedJoinedVenues = localStorage.getItem('joinedVenues')
  if (savedJoinedVenues) joinedVenues.value = JSON.parse(savedJoinedVenues)
  agendaStore.loadAgendaFromLocalStorage()
  watch([venues, joinedVenues], () => {
    saveToLocalStorage()
  }, { deep: true })
  watch(() => agendaStore.agendaList, () => {
    localStorage.setItem('agendaList', JSON.stringify(agendaStore.agendaList))
  }, { deep: true })
})
</script>

<style scoped>
/* 根节点设置基础字体 */
:root {
  font-size: 16px; 
}

/* 页面 */
.create-meeting-view {
  min-height: 100vh;
  background-color: #f5f5f5;
  font-size: .8em; 
}

/* 内容区域 */
.page-content {
  padding: 0.625em 1em; 
  width: 100%;
  box-sizing: border-box;
  margin: 0 auto;
  min-width: 32em;
}

/* 通用卡片 */
.card-common {
  background-color: #ffffff;
  border-radius: 0.5em;
  padding: 0.5em;
  box-shadow: 0 0.125em 0.25em rgba(0,0,0,0.05);
  transition: box-shadow 0.3s ease;
  cursor: default;
  width: 100%; 
  box-sizing: border-box;
}

.card-common:hover {
  box-shadow: 0 0.25em 0.5em rgba(0,0,0,0.08);
}

.card-title {
  font-size: 5em; 
  font-weight: bold;
  color: #333;
  margin-bottom: 0.75em;
}

/* 空数据提示 */
.empty-tip {
  font-size: 4em; 
  color: #999;
  text-align: center;
  padding: 1.25em 0;
  background-color: #fafafa;
  border-radius: 0.375em;
  margin: 0.625em 0;
  width: 100%;
  box-sizing: border-box;
}

/* 按钮组 */
.btn-group {
  display: flex;
  gap: 0.625em;
  width: 100%;
  margin: 0.75em 0;
  flex-wrap: wrap; 
}

/* 创建按钮通用 */
.create-btn {
  background-color: #1989fa;
  color: #fff;
  border: none;
  border-radius: 0.5em;
  padding:0.1em 0.5em;
  font-size: 4em; 
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375em;
  transition: background-color 0.3s ease;
  flex: 1; 
  min-width: 12em; 
}

/* 一键创建会议按钮*/
.main-create-btn {
  background-color: #1989fa;
}


.venue-operation-btn {
  background-color: #4cd964 !important;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  flex: none !important; 
  width: auto !important; 
  min-width: 1em !important; 
  max-width: 10em !important; 
  font-size: 3em !important; 
  padding: 0.5em 1.2em !important;
  border-radius: 0.6em !important;
}

.join-btn {
  composes: venue-operation-btn;
}


.create-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.create-btn:hover {
  opacity: 0.9;
}

/* 会场列表 */
.venue-item {
  padding: 0.75em 0;
  border-bottom: 0.0625em solid #f0f0f0;
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
}

.venue-item:last-child {
  border-bottom: none;
}

.venue-content {
  padding-left: 0.5em;
  width: 100%;
}

.venue-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.5em;
  flex-wrap: wrap; 
  margin-bottom: 0.5em;
  width: 100%;
}

.venue-title {
  font-size: 4.5em; 
  color: #333;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1; 
}

.venue-type-tag {
  padding: 0.125em 0.375em;
  border-radius: 0.1875em;
  font-size: 3em; 
  color: #fff;
  font-weight: 500;
  opacity: 0.9;
  white-space: nowrap;
}

.creator-tag {
  font-size: 3em; 
  color: #999;
  margin-left: 0.5em;
  background-color: #f5f5f5;
  padding: 0.0625em 0.25em;
  border-radius: 0.125em;
  vertical-align: middle;
  white-space: nowrap;
}

.venue-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; 
  gap: 0.625em;
  margin-bottom: 0.5em;
  flex-wrap: wrap; 
  width: 100%;
  gap: 2em;
}

.venue-detail {
  flex: 1;
  min-width: 20em; 
}

.venue-label {
  font-size: 3.5em; 
  color: #666;
  margin-bottom: 0.1875em;
}

.venue-label:last-child {
  margin-bottom: 0;
}

/* 操作按钮 */
.venue-actions-left {
  display: flex;
  gap: 0.5em;
  align-items: center;
  flex-shrink: 0;
  flex-wrap: wrap; 
  justify-content: flex-start;
}

/* 分享ID样式 */
.share-id-row {
  display: flex;
  align-items: center;
  gap: 0.5em;
  flex-shrink: 0;
  margin-top: 0.5em;
  flex-wrap: wrap;
  width: 100%;
}

.share-id-label {
  font-size: 3em; 
  color: #666;
  white-space: nowrap;
}

.share-id {
  display: inline-block;
  background-color: #f0f8ff;
  color: #1989fa;
  padding: 0.125em 0.5em;
  border-radius: 0.25em;
  font-weight: 500;
  font-size: 3.5em; 
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1; 
  min-width: 15em;
}

.share-id:hover {
  background-color: #e6f7ff;
  text-decoration: underline;
}

.venue-actions-right {
  display: flex;
  gap: 0.5em;
  align-items: center;
  justify-content: flex-end;
  margin-top: 0.25em;
  flex-wrap: wrap;
}

/* 议程列表 */
.agenda-list {
  margin-top: 0.625em;
  width: 100%;
}

.agenda-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75em 0;
  border-bottom: 0.0625em solid #f0f0f0;
  cursor: pointer;
  gap: 0.625em;
  flex-wrap: wrap; 
  width: 100%;
}

.agenda-item:last-child {
  border-bottom: none;
}

.agenda-content {
  flex: 1;
  min-width: 20em;
}

.agenda-title {
  font-size: 4.5em; 
  color: #333;
  margin-bottom: 0.25em;
  font-weight: 500;
  white-space: normal;
  word-wrap: break-word;
  line-height: 1.5;
}

.agenda-label {
  font-size: 3.5em; 
  color: #666;
  margin-bottom: 0.125em;
}

.agenda-actions {
  display: flex;
  gap: 0.5em;
  align-items: center;
  flex-shrink: 0;
  flex-wrap: wrap;
}

/* 操作按钮通用 */
.btn-danger {
  background-color: #ff4d4f;
  color: #ffffff;
  border: none;
  border-radius: 0.25em;
  cursor: pointer;
  transition: background-color 0.3s ease;
  padding: 0.25em 0.5em;
  font-size: 3em; 
  white-space: nowrap;
}

.btn-danger:hover {
  background-color: #ff3333;
}

.btn-danger.mini-btn {
  background-color: #ff6b6b;
}

.btn-danger.mini-btn:hover {
  background-color: #ff5252;
}

.btn-edit {
  background-color: #1989fa;
  color: #ffffff;
  border: none;
  border-radius: 0.25em;
  cursor: pointer;
  transition: background-color 0.3s ease;
  padding: 0.25em 0.5em;
  font-size: 3em; 
  white-space: nowrap;
}

.btn-edit:hover {
  background-color: #1677ff;
}

.mini-btn {
  font-size: 3em; 
  flex-shrink: 0;
}

/* 弹窗基础样式 */
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
  padding: 1.25em;
  width: 90%; 
  max-width: 40em;
  min-width: 28em;
  box-sizing: border-box;
}

.dialog-lg {
  width: 95%; 
  max-width: 100em; 
  min-width: 28em;
  max-height: 80vh;
  overflow-y: auto;
}

.dialog-title {
  font-size: 6em; 
  font-weight: bold;
  color: #333;
  margin-bottom: 1em;
  text-align: center;
}

.form-tip {
  font-size: 3em; 
  color: #999;
  margin-top: 0.25em;
  margin-bottom: 1em;
  padding-left: 0.125em;
}

.step-title {
  font-size: 4.5em; 
  font-weight: bold;
  color: #1989fa;
  margin-bottom: 0.75em;
  padding-bottom: 0.5em;
  border-bottom: 0.0625em solid #f0f0f0;
}

.dialog-btn-group {
  display: flex;
  gap: 0.625em;
  margin-top: 1.25em;
  flex-wrap: wrap; 
}

.dialog-confirm-btn {
  flex: 1;
  padding: 0.625em 0;
  background-color: #1989fa;
  color: #ffffff;
  border: none;
  border-radius: 0.25em;
  font-size: 4em; 
  cursor: pointer;
  transition: opacity 0.2s ease;
  min-width: 12em;
}

.dialog-confirm-btn:hover {
  opacity: 0.9;
}

.dialog-cancel-btn {
  flex: 1;
  padding: 0.625em 0;
  background-color: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 0.25em;
  font-size: 4em; 
  cursor: pointer;
  transition: background-color 0.2s ease;
  min-width: 12em;
}

.dialog-cancel-btn:hover {
  background-color: #e8e8e8;
}

/* 表单通用样式：宽度100%自适应 */
.form-item {
  margin-bottom: 1em;
  width: 100%;
}

.form-label {
  font-size: 4em; 
  color: #333;
  margin-bottom: 0.25em;
  display: block;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.5em 0.625em;
  border: 0.0625em solid #e5e5e5;
  border-radius: 0.25em;
  font-size: 3.5em; 
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  border-color: #1989fa;
  outline: none;
}

.color-input {
  height: 2.5em;
  padding: 0.125em;
  cursor: pointer;
  width: 100%;
}

.file-input {
  width: 100%;
  padding: 0.5em;
  font-size: 3.5em; 
  color: #666;
}

/* 流程编辑区域样式：宽度100%自适应 */
.flow-form-item {
  margin-bottom: 1.25em;
  margin-top: 0.9375em;
  width: 100%;
}

.flow-add-btn {
  display: flex;
  align-items: center;
  gap: 0.375em;
  padding: 0.5em 0.75em;
  background-color: #f5f5f5fafe;
  border: 0.0625em dashed #1989fa;
  border-radius: 0.25em;
  color: #1989fa;
  font-size: 3.5em; 
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 0.75em;
  width: 100%;
}

.flow-add-btn:hover {
  background-color: #e6f7ff;
}

.flow-step-list {
  display: flex;
  flex-direction: column;
  gap: 1em;
  width: 100%;
}

.flow-step-item {
  padding: 0.75em;
  background-color: #fafafa;
  border-radius: 0.375em;
  width: 100%;
  box-sizing: border-box;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75em;
  flex-wrap: wrap;
}

.step-num {
  font-size: 3.5em; 
  font-weight: bold;
  color: #1989fa;
  white-space: nowrap;
}

.step-del-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.125em;
  border-radius: 0.125em;
  transition: background-color 0.2s ease;
}

.step-del-btn:hover {
  background-color: #ffebeb;
}

.step-form-content {
  display: flex;
  flex-direction: column;
  gap: 0.625em;
  width: 100%;
}

.step-form-item {
  margin-bottom: 0;
  width: 100%;
}

.step-form-label {
  font-size: 3.5em; 
  color: #333;
  margin-bottom: 0.1875em;
}

.step-input {
  font-size: 3em; 
  padding: 0.375em 0.5em;
  width: 100%;
  box-sizing: border-box;
}

.step-textarea {
  font-size: 3em; 
  padding: 0.375em 0.5em;
  resize: vertical;
  min-height: 3.75em;
  width: 100%;
  box-sizing: border-box;
}

/* 加入的会场及议程容器：宽度100%自适应 */
.joined-content {
  margin-top: 0.625em;
  width: 100%;
}

/* 复制成功提示：自适应屏幕居中 */
.toast-mask {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-content {
  background-color: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  padding: 0.625em 1.25em;
  border-radius: 0.25em;
  font-size: 3em; 
  animation: fadeInOut 1.5s ease;
  white-space: nowrap; /* 提示文字不换行 */
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-1.25em); }
  20% { opacity: 1; transform: translateY(0); }
  80% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-1.25em); }
}
</style>