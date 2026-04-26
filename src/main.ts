// 引入unocss css
import '@/plugins/unocss'

// 导入全局的svg图标
import '@/plugins/svgIcon'

// 初始化多语言
import { setupI18n } from '@/plugins/vueI18n'

// 引入状态管理
import { setupStore } from '@/store'

// 全局组件
import { setupGlobCom } from '@/components'

// 引入 element-plus
import { setupElementPlus } from '@/plugins/elementPlus'

// 引入 form-create
import { setupFormCreate } from '@/plugins/formCreate'
import { MotionPlugin } from '@vueuse/motion'

// 引入全局样式
import '@/styles/index.scss'

// 引入动画
import '@/plugins/animate.css'

//引入 iconify
import { addCollection } from '@iconify/vue'

import ep from '@iconify-json/ep/icons.json'
import mdi from '@iconify-json/mdi/icons.json'
import fa from '@iconify-json/fa/icons.json'
import ant from '@iconify-json/ant-design/icons.json'



import VueDOMPurifyHTML from 'vue-dompurify-html' // 解决v-html 的安全隐患

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTh, faCamera, faBorderNone, faBorderAll, faVideo, faCompress,
   faExpand, faTimes, faPlusCircle, faTrashAlt, faInfoCircle, faChevronLeft, faChevronRight,
  faListCheck,faBoxArchive,faBell
  } 
   from '@fortawesome/free-solid-svg-icons';

library.add(faTh, faCamera, faBorderNone, faBorderAll, 
  faVideo, faCompress, faExpand, faTimes, faPlusCircle, 
  faTrashAlt, faInfoCircle, faChevronLeft, faChevronRight,faListCheck,faBoxArchive,faBell
);


// 路由
import router, { setupRouter } from '@/router'

// 指令
import { setupAuth, setupMountedFocus } from '@/directives'

import { createApp } from 'vue'

import App from './App.vue'

import './permission'

import '@/plugins/tongji' // 百度统计
import Logger from '@/utils/Logger'

// 创建实例
const setupAll = async () => {
  // const outConfig = await fetch('/vms/config.json')
  // let globalConfig = {}
  // if (outConfig.ok) {
  //   globalConfig = await outConfig.json();
  // }

  const app = createApp(App)

  // app.provide('RUNTIME_CONFIG', globalConfig)

  addCollection(ep)
  addCollection(mdi)
  addCollection(fa)
  addCollection(ant)


  await setupI18n(app)

  setupStore(app)

  setupGlobCom(app)

  setupElementPlus(app)

  setupFormCreate(app)

  setupRouter(app)

  // directives 指令
  setupAuth(app)
  setupMountedFocus(app)

  await router.isReady()

  app.use(VueDOMPurifyHTML)
  app.use(MotionPlugin)
  app.component('font-awesome-icon', FontAwesomeIcon)
  app.mount('#app')
}

setupAll()

Logger.prettyPrimary(`欢迎使用`, import.meta.env.VITE_APP_TITLE)
