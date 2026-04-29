import { defineStore } from 'pinia'
import { store } from '@/store'
import { cloneDeep } from 'lodash-es'
import remainingRouter from '@/router/modules/remaining'
import { flatMultiLevelRoutes, generateRoute } from '@/utils/routerHelper'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'

const { wsCache } = useCache()

export interface PermissionState {
  routers: AppRouteRecordRaw[]
  addRouters: AppRouteRecordRaw[]
  menuTabRouters: AppRouteRecordRaw[]
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    routers: [],
    addRouters: [],
    menuTabRouters: []
  }),
  getters: {
    getRouters(): AppRouteRecordRaw[] {
      return this.routers
    },
    getAddRouters(): AppRouteRecordRaw[] {
      return flatMultiLevelRoutes(cloneDeep(this.addRouters))
    },
    getMenuTabRouters(): AppRouteRecordRaw[] {
      return this.menuTabRouters
    }
  },
  actions: {
    async generateRoutes(): Promise<unknown> {
      return new Promise<void>(async (resolve) => {
        // 获得菜单列表
        let res: AppCustomRouteRecordRaw[] = []
        const roleRouters = wsCache.get(CACHE_KEY.ROLE_ROUTERS)
        if (roleRouters) {
          res = roleRouters as AppCustomRouteRecordRaw[]
        }

        // Full English Mock Data based on router.txt and directory analysis
        const mockRes: any[] = [
          {
            path: '/vms',
            name: 'VMS Monitoring',
            icon: 'ep:scale-to-original',
            visible: true,
            component: '#',
            children: [
              { path: 'wall', name: 'Video Wall', icon: 'ep:grid', visible: true, component: 'views/vms/wall/index' },
              { path: 'live', name: 'Live Monitor', icon: 'ep:video-play', visible: true, component: 'views/vms/camera/index' },
              { path: 'playback', name: 'Video Playback', icon: 'ep:refresh-right', visible: true, component: 'views/vms/playback/index' }
            ]
          },
          {
            path: '/retrieval',
            name: 'AI Retrieval',
            icon: 'ep:search',
            visible: true,
            component: '#',
            children: [
              { path: 'face', name: 'Face Search', icon: 'ep:user', visible: true, component: 'views/retrieval/index' },
              { path: 'portrait', name: 'Portrait Search', icon: 'ep:avatar', visible: true, component: 'views/profile_db/index' },
              { path: 'vehicle', name: 'Vehicle Search', icon: 'ep:aim', visible: true, component: 'views/vehicle/index' }
            ]
          },
          {
            path: '/alarmview',
            name: 'Alarm Center',
            icon: 'ep:bell-filled',
            visible: true,
            component: '#',
            children: [{ path: 'index', name: 'Alarm Dashboard', icon: 'ep:bell', visible: true, component: 'views/alarm/realtime/index' }]
          },
          {
            path: '/library',
            name: 'Resource Library',
            icon: 'ep:office-building',
            visible: true,
            component: '#',
            children: [
              { path: 'vehicle-db', name: 'Vehicle Database', icon: 'ep:box', visible: true, component: 'views/vehicle_db/index' },
              { path: 'surveillance', name: 'Surveillance Lib', icon: 'ep:guide', visible: true, component: 'views/Library/manage/index' }
            ]
          },
          {
            path: '/system',
            name: 'Administration',
            icon: 'ep:tools',
            visible: true,
            component: '#',
            children: [
              { path: 'user', name: 'User Management', icon: 'ep:user-filled', visible: true, component: 'views/system/user/index' },
              { path: 'role', name: 'Role Permission', icon: 'ep:key', visible: true, component: 'views/system/role/index' },
              { path: 'dept', name: 'Organization', icon: 'fa:address-book', visible: true, component: 'views/system/dept/index' },
              { path: 'log', name: 'Operation Logs', icon: 'ep:document-list', visible: true, component: 'views/system/operatelog/index' }
            ]
          }
        ]

        const routerMap: AppRouteRecordRaw[] = generateRoute(mockRes)
        this.addRouters = routerMap.concat([
          {
            path: '/:path(.*)*',
            component: () => import('@/views/Error/404.vue'),
            name: '404Page',
            meta: { hidden: true, breadcrumb: false }
          }
        ])
        this.routers = cloneDeep(remainingRouter).concat(routerMap)
        resolve()
      })
    },
    setMenuTabRouters(routers: AppRouteRecordRaw[]): void {
      this.menuTabRouters = routers
    }
  },
  persist: false
})

export const usePermissionStoreWithOut = () => {
  return usePermissionStore(store)
}
