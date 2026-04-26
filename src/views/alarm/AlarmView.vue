<script lang="ts" setup>
import RealTimePage from './realtime/index.vue'
import FaceTaskPage from './facetask/index.vue'
import FaceHistoryPage from './facehistory/index.vue'
import VehicleTaskPage from './platetask/index.vue'
import VehicleHistoryPage from './platehistory/index.vue'
import { TrendCharts, User, Setting, Bell, DArrowLeft, DArrowRight } from '@element-plus/icons-vue'
defineOptions({
  name: 'AlarmView'
})

const panes = ref([
  { key: 1, label: 'Real-Time' },
  { key: 2, label: 'History' },
  { key: 3, label: 'Task' }
])
const leftPaneModel = ref('1')
const faceVehiclePaneModel = ref(1)
const displayPage = ref('1')
const changeLeftMenu = (item) => {
  displayPage.value = item.index
}
const menuKey = ref(1)
const changeMenu = (idx, apiTaskId) => {
  activeMenu.value = idx
  displayPage.value = idx
  menuKey.value++
  if (idx == '2-1') {
    historyTaskName.value.faceApiTaskId = apiTaskId
  } else if (idx == '2-2') {
    historyTaskName.value.vehicleApiTaskId = apiTaskId
  }
}

const historyTaskName = ref({
  faceApiTaskId: '',
  vehicleApiTaskId: ''
})

const layout = ref({
  leftWidth: '5.6%',
  rightWidth: '94.4%'
})

const menuName = ref({
  realTime: 'Real-time',
  history: 'History',
  task: 'Task',
  face: 'Face',
  vehicle: 'Vehicle'
})
const sidebarOpen = ref(false)

computed(() => {
  sidebarOpen ? (layout.value.leftWidth = 'w-5.6%') : (layout.value.leftWidth = 'w-2%')
})

const isCollapsed = ref(false)
const activeMenu = ref('1')

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>
<template>
  <!-- :style="{ width: layout.leftWidth }"   :style="{ width: layout.rightWidth }"-->
  <div class="w-100% flex justify-start">
    <!-- <div class="left-side h-90vh relative border-1 border-solid border-coolgray" :class="sidebarOpen ? 'w-5.6%' : 'w-1.5%'">
      <div
        @click="sidebarOpen = !sidebarOpen"
        class="absolute right--17px top-50% z-9999 cursor-pointer bg-#fff"
        style="border-top: 1px solid grey;border-right: 1px solid grey;border-bottom: 1px solid grey;"
      >
        <el-icon v-if="sidebarOpen"><DArrowLeft /> </el-icon>
        <el-icon v-else><DArrowRight /> </el-icon>
      </div>
      <el-menu
        :key="menuKey"
        mode="vertical"
        class="alarm-menu"
        :default-active="leftPaneModel"
        :unique-opened="true"
      >
        <el-menu-item index="1" @click="changeLeftMenu" title="Real-Time">
          <span v-if="sidebarOpen">{{ menuName.realTime }}</span>
          <span v-else><i class="fa-regular fa-clock"></i></span>
        </el-menu-item>
        <el-sub-menu index="2">
          <template #title>
            <span v-if="sidebarOpen"> {{ menuName.history }} </span>
            <span v-else><i class="fa-solid fa-clock-rotate-left"></i></span>
          </template>
          <el-menu-item index="2-1" @click="changeLeftMenu" title="History-Face">
            <span v-if="sidebarOpen"> {{ menuName.face }} </span>
            <span v-else>2-1</span>
          </el-menu-item>
          <el-menu-item index="2-2" @click="changeLeftMenu" title="History-Vehicle">
            <span v-if="sidebarOpen"> {{ menuName.vehicle }} </span>
            <span v-else>2-2</span>
          </el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="3">
          <template #title>
            <span v-if="sidebarOpen"> {{ menuName.task }} </span>
            <span v-else>3</span>
          </template>
          <el-menu-item index="3-1" @click="changeLeftMenu" title="Task-Face">
            <span v-if="sidebarOpen"> {{ menuName.face }} </span>
            <span v-else>3-1</span>
          </el-menu-item>
          <el-menu-item index="3-2" @click="changeLeftMenu" title="Task-Face">
            <span v-if="sidebarOpen"> {{ menuName.vehicle }} </span>
            <span v-else>3-2</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div> -->

    <aside :class="['sidebar', { 'is-collapsed': isCollapsed }]">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        :collapse-transition="false"
        background-color="#ffffff"
        text-color="#303133"
        active-text-color="#409eff"
        class="sidebar-menu"
        :unique-opened="true"
      >
        <!-- 仪表盘 - 无子菜单 -->
        <el-menu-item index="1" title="Real-Time" @click="changeLeftMenu">
          <!-- <el-icon><TrendCharts /></el-icon> -->
          <font-awesome-icon :icon="['fas', 'bell']" />
          <span>{{ menuName.realTime }}</span>
        </el-menu-item>

        <!-- 用户管理 - 有子菜单 -->
        <el-sub-menu index="2">
          <template #title>
            <!-- <el-icon title="History"><User /></el-icon> -->
            <font-awesome-icon :icon="['fas', 'box-archive']" />
            <span>{{ menuName.history }}</span>
          </template>
          <el-menu-item index="2-1" @click="changeLeftMenu" class="child">{{
            menuName.face
          }}</el-menu-item>
          <el-menu-item index="2-2" @click="changeLeftMenu" class="child">{{
            menuName.vehicle
          }}</el-menu-item>
        </el-sub-menu>

        <!-- 系统设置 - 有子菜单 -->
        <el-sub-menu index="3" title="Task">
          <template #title>
            <!-- <el-icon><Setting /></el-icon> -->
            <!-- <i class="fa-solid fa-list-check"></i> -->
            <font-awesome-icon :icon="['fas', 'list-check']" />
            <span>{{ menuName.task }}</span>
          </template>
          <el-menu-item index="3-1" @click="changeLeftMenu" class="child">{{
            menuName.face
          }}</el-menu-item>
          <el-menu-item index="3-2" @click="changeLeftMenu" class="child">{{
            menuName.vehicle
          }}</el-menu-item>
        </el-sub-menu>
      </el-menu>

      <div class="toggle-btn-container">
        <el-button @click="toggleSidebar" type="primary" link class="toggle-btn">
          <el-icon :size="18">
            <component :is="isCollapsed ? DArrowRight : DArrowLeft" />
          </el-icon>
          <transition name="fade">
            <span v-show="!isCollapsed" class="toggle-text">Collapse</span>
          </transition>
        </el-button>
      </div>
    </aside>

    <div class="right-side h-90vh" :class="[{ 'is-collapsed': isCollapsed }]">
      <div class="real-time-page" v-if="displayPage == '1'">
        <RealTimePage />
      </div>
      <FaceHistoryPage v-if="displayPage == '2-1'" :apiTaskId="historyTaskName.faceApiTaskId" />
      <VehicleHistoryPage
        v-if="displayPage == '2-2'"
        :apiTaskId="historyTaskName.vehicleApiTaskId"
      />
      <FaceTaskPage
        v-if="displayPage == '3-1'"
        @to-face-history="(val) => changeMenu('2-1', val)"
      />
      <VehicleTaskPage
        v-if="displayPage == '3-2'"
        @to-vehicle-history="(val) => changeMenu('2-2', val)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
// ::v-deep .el-menu-item.is-active {
//   background-color: rgb(33, 83, 155);
//   color: #fff;
// }

// .left-side {
//   background: #1c1843;
// }
// ::v-deep .el-menu {
//   background-color: #1c1843;
// }
// ::v-deep .el-menu * {
//   color: #fff !important;
// }
// ::v-deep .alarm-menu .el-menu-item:hover,
// ::v-deep .alarm-menu .el-sub-menu__title:hover,
// ::v-deep .alarm-menu .el-menu-item.is-active {
//   background-color: rgba(218, 235, 253, 0.3) !important;
// }
</style>
<style scoped lang="scss">
/* 侧边栏宽度定义 */
$sidebar-width-open: 5.6%; /* 展开时的宽度 */
$rightside-width-open: 94.4%; /* 展开时的宽度 */

$sidebar-width-closed: 2%; /* 收缩时的宽度 */
$rightside-width-closed: 98%; /* 收缩时的宽度 */
$transition-duration: 0.3s; /* 动画时长 */

.app-layout {
  display: flex;
  height: 100vh;
}

/* 侧边栏容器 */
.sidebar {
  background-color: #f5f7fa; /* 深色背景 */
  color: #303133;
  width: $sidebar-width-open;
  transition: width $transition-duration ease; /* 关键：宽度动画 */
  flex-shrink: 0; /* 防止被压缩 */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止内容溢出 */
}

.right-side {
  width: $rightside-width-open;
}

/* 收缩状态 */
.sidebar.is-collapsed {
  width: $sidebar-width-closed;
}
.right-side.is-collapsed {
  width: $rightside-width-closed;
}

/* Element Plus 菜单样式覆盖 */
.sidebar-menu {
  flex-grow: 1;
  border: none;
  padding-top: 15px;
  width: 100% !important; /* 强制菜单宽度跟随父容器 */
}

/* 折叠状态下的菜单 */
.sidebar-menu.el-menu--collapse {
  width: 100% !important; /* 折叠时也强制跟随父容器宽度 */
}

/* 覆盖 Element Plus 默认的折叠宽度 */
:deep(.el-menu--collapse) {
  width: 100% !important;
}

:deep(.el-menu--collapse > .el-menu-item),
:deep(.el-menu--collapse > .el-sub-menu > .el-sub-menu__title) {
  padding: 0 !important;
  text-align: center;
  justify-content: center;
}

/* 菜单项样式 */
:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
  color: #303133 !important;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: #e4e7ed !important;
  color: #409eff !important;
}

:deep(.el-menu-item.is-active) {
  color: #409eff !important;
  background-color: #e4e7ed !important;
}

/* 子菜单样式 */
:deep(.el-menu--inline) {
  background-color: #ffffff !important;
}

:deep(.el-menu--inline .el-menu-item) {
  padding-left: 50px !important;
  background-color: #ffffff !important;
}

:deep(.el-menu--inline .el-menu-item:hover) {
  background-color: #e4e7ed !important;
  color: #409aff !important;
}
:deep(.el-menu--inline .el-menu-item.is-active) {
  color: #409eff !important;
  background-color: #e4e7ed !important;
}

/* 折叠状态下的子菜单弹出框 */
:deep(.el-menu--popup) {
  background-color: #ffffff !important;
  min-width: 80px !important;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px rgba(0, 0, 0, 0.1);
}

:deep(.el-menu--popup .el-menu-item) {
  color: #606266 !important;
}

:deep(.el-menu--popup .el-menu-item:hover) {
  background-color: #f5f6f7 !important;
  color: #409eff !important;
}

/* 图标样式 */
:deep(.el-icon) {
  color: inherit;
  font-size: 14px;
}

/* 展开状态：隐藏图标 */
.sidebar:not(.is-collapsed) :deep(.el-menu-item .el-icon),
.sidebar:not(.is-collapsed) :deep(.el-sub-menu__title .el-icon) {
  display: none !important;
}

/* 折叠状态：显示图标，隐藏文字 */
.sidebar.is-collapsed :deep(.el-icon) {
  display: inline-flex !important;
  font-size: 16px;
}

.sidebar.is-collapsed :deep(.el-menu-item span),
.sidebar.is-collapsed :deep(.el-sub-menu__title span) {
  display: none !important;
}

/* 隐藏折叠状态下的子菜单箭头 */
.sidebar.is-collapsed :deep(.el-sub-menu__icon-arrow) {
  display: none !important;
}

/* 折叠状态下的菜单项 */
.sidebar.is-collapsed :deep(.el-menu-item),
.sidebar.is-collapsed :deep(.el-sub-menu__title) {
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* 展开状态下的菜单项 - 调整文字样式 */
.sidebar:not(.is-collapsed) :deep(.el-menu-item),
.sidebar:not(.is-collapsed) :deep(.el-sub-menu__title) {
  font-size: 12px;
  padding-left: 10px !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar:not(.is-collapsed) :deep(.el-menu--inline .el-menu-item) {
  padding-left: 25px !important;
}

/* 切换按钮区域 */
.toggle-btn-container {
  padding: 15px;
  border-top: 1px solid #e4e7ed;
  background-color: #ffffff;
}

.toggle-btn {
  width: 100%;
  color: #606266 !important;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 左对齐 */
  padding: 8px 0;
}

/* 折叠状态下按钮居中 */
.sidebar.is-collapsed .toggle-btn {
  justify-content: center;
}

.toggle-btn:hover {
  color: #409eff !important;
}

.toggle-text {
  margin-left: 8px;
  color: #606266 !important;
}

/* -------------------- */
/* 主内容区 */
/* -------------------- */
.main-content {
  flex-grow: 1;
  padding: 20px;
  background-color: #f0f2f5;
  transition: margin-left $transition-duration ease;
}

/* -------------------- */
/* 动画效果 */
/* -------------------- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity $transition-duration;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
