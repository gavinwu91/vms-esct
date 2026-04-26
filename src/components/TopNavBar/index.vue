<template>
  <div class="top-bar">
    <router-link to="/" class="left-title"><img style="width: 36px;height: 36px;margin-right: 5px;"
                                                src="@/assets/imgs/logo.png"/>منظومة سحاب المرئية
    </router-link>

    <div class="menu">
      <el-menu
        mode="horizontal"
        :default-active="activeMenu"
        @select="handleSelect"
        background-color="transparent"
        text-color="#fff"
        active-text-color="#00ccff"
        class="custom-menu"
        popper-class="custom-popup"
        :ellipsis="true"
        router
      >
        <el-menu-item v-for="(item,index) in routers" :key="index" :index="item.path">
          <Icon :icon="item.meta.icon||item.children[0].meta.icon"/>
          {{ t(item.meta.title || item.children[0].meta.title) }}
        </el-menu-item>
      </el-menu>
    </div>
    <div class="right-tools">
      <el-icon class="icon" @click="toggleFullscreen">
        <FullScreen/>
      </el-icon>
      <el-icon class="icon">
        <Setting/>
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {FullScreen, Setting} from '@element-plus/icons-vue'
import {usePermissionStore} from '@/store/modules/permission'
import {hasOneShowingChild} from "@/layout/components/Menu/src/helper";
import {isUrl} from "@/utils/is";
import {pathResolve} from "@/utils/routerHelper";
import {Icon} from "@/components/Icon";
import {useI18n} from "../../hooks/web/useI18n";

const {t} = useI18n()

const permissionStore = usePermissionStore()
const routers = permissionStore.getRouters.filter((v) => !v.meta?.hidden)

console.log("routers:", routers)
const activeMenu = ref('/')
const currentTime = ref('')
//全屏方法
const isFullscreen = ref(false);

function toggleFullscreen() {
  // const el = fullscreenRef.value

  if (!document.fullscreenElement) {
    document.body.requestFullscreen().then(() => {
      isFullscreen.value = true
    })
  } else {
    document.exitFullscreen().then(() => {
      isFullscreen.value = false
    })
  }
}

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

onMounted(() => {
  // updateTime()
  // setInterval(updateTime, 1000)
})

function handleSelect(index) {
  activeMenu.value = index
}
</script>


<style scoped lang="scss">



.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background:var(--top-bar-bg);

  color: #fff;
  padding: 0 24px 0 10px;
  height: 50px;
  font-size: 16px;
  border-bottom: 1px solid #0f2a47;
  box-shadow: 0 2px 4px rgba(0, 128, 255, 0.1);
}

.left-title {
  font-weight: bold;
  font-size: 15px;
  white-space: nowrap;
  width: 222px;
  display: flex;
  align-items: center;
  color: #fff;
  text-decoration: none;

}

.menu {
  display: flex;
  justify-content: center;

}

.custom-menu {
  border-bottom: none !important;
  height: 50px;
}

.custom-menu .el-menu-item {
  color: #ccc !important;
  font-weight: 500;
  padding: 0 15px;
  font-size: 13px;
  color: #fff !important;
  transition: color 0.3s, background-color 0.3s;
}

.custom-menu .el-menu-item:hover {
  color: #00bfff !important;
  background-color: rgba(0, 128, 255, 0.1) !important;
}



.right-tools {
  display: flex;
  align-items: center;
  gap: 16px;
}

.time {
  text-align: right;
}

.icon {
  cursor: pointer;
  color: #ccc;
  transition: color 0.3s;
}

.icon:hover {
  color: #00ccff;
}
</style>
<style lang="scss">
.custom-popup {
  .el-menu {
    background-color: rgba(13, 42, 74, .9) !important;
  }
}

</style>
