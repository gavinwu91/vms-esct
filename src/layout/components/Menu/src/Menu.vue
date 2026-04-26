<script lang="tsx">
import { PropType } from 'vue'
import { ElMenu, ElScrollbar } from 'element-plus'
import { useAppStore } from '@/store/modules/app'
import { usePermissionStore } from '@/store/modules/permission'
import { useRenderMenuItem } from './components/useRenderMenuItem'
import { isUrl } from '@/utils/is'
import { useDesign } from '@/hooks/web/useDesign'
import { LayoutType } from '@/types/layout'
import * as authUtil from '@/utils/auth'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('menu')

export default defineComponent({
  // eslint-disable-next-line vue/no-reserved-component-names
  name: 'Menu',
  props: {
    menuSelect: {
      type: Function as PropType<(index: string) => void>,
      default: undefined
    }
  },
  setup(props) {
    const appStore = useAppStore()

    const layout = computed(() => appStore.getLayout)
    console.log(layout)
    const { push, currentRoute } = useRouter()

    const permissionStore = usePermissionStore()
    const menuMode = computed((): 'vertical' | 'horizontal' => {
      // 竖
      const vertical: LayoutType[] = ['classic', 'topLeft', 'cutMenu', 'vmsUi']

      if (vertical.includes(unref(layout))) {
        return 'vertical'
      } else {
        return 'horizontal'
      }
    })

    const routers = computed(() => {
      const tenantid = authUtil.getTenantId()
      if (tenantid === 1) {
        return [
          {
            path: '/redirect',
            name: 'Redirect',
            children: [{ path: '/redirect/:path(.*)', name: 'Redirect', meta: {} }],
            meta: { hidden: true, noTagsView: true }
          },
          {
            path: '/',
            redirect: '/index',
            name: 'Home',
            meta: {},
            children: [
              {
                path: 'index',
                name: 'Index',
                meta: {
                  title: 'router.home',
                  icon: 'ep:home-filled',
                  noCache: false,
                  affix: true
                }
              }
            ]
          },
          {
            path: '/user',
            name: 'UserInfo',
            meta: { hidden: true },
            children: [
              {
                path: 'profile',
                name: 'Profile',
                meta: {
                  canTo: true,
                  hidden: true,
                  noTagsView: false,
                  icon: 'ep:user',
                  title: 'common.profile'
                }
              },
              {
                path: 'notify-message',
                name: 'MyNotifyMessage',
                meta: {
                  canTo: true,
                  hidden: true,
                  noTagsView: false,
                  icon: 'ep:message',
                  title: 'My message'
                }
              }
            ]
          },
          {
            path: '/login',
            name: 'Login',
            meta: { hidden: true, title: 'router.login', noTagsView: true }
          },
          {
            path: '/sso',
            name: 'SSOLogin',
            meta: { hidden: true, title: 'router.login', noTagsView: true }
          },
          {
            path: '/social-login',
            name: 'SocialLogin',
            meta: {
              hidden: true,
              title: 'router.socialLogin',
              noTagsView: true
            }
          },
          {
            path: '/403',
            name: 'NoAccess',
            meta: { hidden: true, title: '403', noTagsView: true }
          },
          {
            path: '/404',
            name: 'NoFound',
            meta: { hidden: true, title: '404', noTagsView: true }
          },
          {
            path: '/500',
            name: 'Error',
            meta: { hidden: true, title: '500', noTagsView: true }
          },
          {
            path: '/:pathMatch(.*)*',
            name: '',
            meta: { title: '404', hidden: true, breadcrumb: false }
          },
          {
            path: '/vmd/dashboard',
            name: '',
            meta: { title: '404', hidden: true, breadcrumb: false }
          },
          {
            path: '/Library',
            name: '/Library',
            meta: {
              title: 'Library ',
              icon: 'ep:office-building',
              hidden: false,
              noCache: false,
              alwaysShow: true
            },
            children: [
              {
                path: 'manage',
                name: 'Manage',
                meta: {
                  title: 'Portrait library',
                  icon: 'ep:coin',
                  hidden: false,
                  noCache: false,
                  alwaysShow: null
                }
              },
              {
                path: 'manage/person',
                name: 'PortraitPerson',
                meta: {
                  title: 'Portrait person',
                  icon: 'ep:avatar',
                  hidden: true,
                  noCache: true,
                  alwaysShow: null
                }
              }
            ]
          },
          {
            path: '/camera',
            name: '/cameraParent',
            redirect: '',
            meta: { hidden: false },
            children: [
              {
                path: '',
                name: '/camera',
                meta: {
                  title: 'Device Management',
                  icon: 'ep:view',
                  hidden: false,
                  noCache: false,
                  alwaysShow: true
                }
              }
            ]
          },
          {
            path: '/area',
            name: '/areaParent',
            redirect: '',
            meta: { hidden: false },
            children: [
              {
                path: '',
                name: '/area',
                meta: {
                  title: 'Area Management',
                  icon: 'ep:basketball',
                  hidden: false,
                  noCache: false,
                  alwaysShow: true
                }
              }
            ]
          },
          {
            path: '/cameralog',
            name: '/cameralog',
            meta: {
              title: 'Device Status',
              hidden: false,
              noCache: false,
              alwaysShow: null
            }
          },
          {
            path: '/messages',
            name: 'Messages',
            meta: {
              title: 'Message Center',
              icon: 'ep:chat-dot-round',
              hidden: false,
              noCache: false,
              alwaysShow: true
            },
            children: [
              {
                path: 'notify-template',
                name: 'SystemNotifyTemplate',
                meta: {
                  title: 'Template Management ',
                  icon: 'fa:archive',
                  hidden: false,
                  noCache: false,
                  alwaysShow: null
                }
              },
              {
                path: 'notify-message',
                name: 'SystemNotifyMessage',
                meta: {
                  title: 'Message Record ',
                  icon: 'fa:edit',
                  hidden: false,
                  noCache: false,
                  alwaysShow: null
                }
              },
              {
                path: 'alarmrule',
                name: 'alarmrule',
                meta: {
                  title: 'Alarm Rule',
                  icon: 'fa:address-card',
                  hidden: false,
                  noCache: false,
                  alwaysShow: null
                }
              }
            ]
            // children: [
            //   {
            //     path: 'notify',
            //     name: 'Notify',
            //     meta: {
            //       title: 'On-site information management ',
            //       icon: 'ep:message-box',
            //       hidden: false,
            //       noCache: false,
            //       alwaysShow: true
            //     },
            //     children: [
            //       {
            //         path: 'notify-template',
            //         name: 'SystemNotifyTemplate',
            //         meta: {
            //           title: 'Template management ',
            //           icon: 'fa:archive',
            //           hidden: false,
            //           noCache: false,
            //           alwaysShow: null
            //         }
            //       },
            //       {
            //         path: 'notify-message',
            //         name: 'SystemNotifyMessage',
            //         meta: {
            //           title: 'Message record ',
            //           icon: 'fa:edit',
            //           hidden: false,
            //           noCache: false,
            //           alwaysShow: null
            //         }
            //       }
            //     ]
            //   }
            // ]
          },
          {
            path: '/user',
            name: '/user',
            meta: {
              title: 'User Management',
              icon: 'ep:tools',
              hidden: false,
              noCache: false,
              alwaysShow: true
            },
            children: [
              {
                path: 'user',
                name: 'SystemUser',
                meta: {
                  title: 'User Management',
                  icon: 'ep:avatar',
                  hidden: false,
                  noCache: false,
                  alwaysShow: null
                }
              },
              {
                path: 'role',
                name: 'SystemRole',
                meta: {
                  title: 'Role Management',
                  icon: 'ep:user',
                  hidden: false,
                  noCache: false,
                  alwaysShow: null
                }
              },
              {
                path: 'dept',
                name: 'SystemDept',
                meta: {
                  title: 'Departmental Management',
                  icon: 'fa:address-card',
                  hidden: false,
                  noCache: false,
                  alwaysShow: null
                }
              }
            ]
          },
          {
            path: '/tenant',
            name: 'Tenant',
            meta: {
              title: 'Tenant Management',
              icon: 'fa-solid:house-user',
              hidden: false,
              noCache: false,
              alwaysShow: true
            },
            children: [
              {
                path: 'list',
                name: 'SystemTenant',
                meta: {
                  title: 'Tenant List ',
                  icon: 'ep:house',
                  hidden: false,
                  noCache: false,
                  alwaysShow: null
                }
              },
              {
                path: 'package',
                name: 'SystemTenantPackage',
                meta: {
                  title: 'Tenant Plan',
                  icon: 'fa:bars',
                  hidden: false,
                  noCache: false,
                  alwaysShow: null
                }
              }
            ]
          },
          {
            path: '/system',
            name: '/system',
            meta: {
              title: 'System Management',
              icon: 'ep:tools',
              hidden: false,
              noCache: false,
              alwaysShow: true
            },
            children: [
              // {
              //   path: 'tenant',
              //   name: 'Tenant',
              //   meta: {
              //     title: 'Tenant management ',
              //     icon: 'fa-solid:house-user',
              //     hidden: false,
              //     noCache: false,
              //     alwaysShow: true
              //   },
              //   children: [
              //     {
              //       path: 'list',
              //       name: 'SystemTenant',
              //       meta: {
              //         title: 'Tenant list ',
              //         icon: 'ep:house',
              //         hidden: false,
              //         noCache: false,
              //         alwaysShow: null
              //       }
              //     },
              //     {
              //       path: 'package',
              //       name: 'SystemTenantPackage',
              //       meta: {
              //         title: 'Tenant Plan ',
              //         icon: 'fa:bars',
              //         hidden: false,
              //         noCache: false,
              //         alwaysShow: null
              //       }
              //     }
              //   ]
              // },
              // {
              //   path: 'user',
              //   name: 'SystemUser',
              //   meta: {
              //     title: 'User management ',
              //     icon: 'ep:avatar',
              //     hidden: false,
              //     noCache: false,
              //     alwaysShow: null
              //   }
              // },
              // {
              //   path: 'role',
              //   name: 'SystemRole',
              //   meta: {
              //     title: 'Role management ',
              //     icon: 'ep:user',
              //     hidden: false,
              //     noCache: false,
              //     alwaysShow: null
              //   }
              // },
              {
                path: 'menu',
                name: 'SystemMenu',
                meta: {
                  title: 'Menu Management',
                  icon: 'ep:menu',
                  hidden: false,
                  noCache: false,
                  alwaysShow: null
                }
              }
              // {
              //   path: 'dept',
              //   name: 'SystemDept',
              //   meta: {
              //     title: 'Departmental management ',
              //     icon: 'fa:address-card',
              //     hidden: false,
              //     noCache: false,
              //     alwaysShow: null
              //   }
              // }
              // {
              //   path: 'messages',
              //   name: 'Messages',
              //   meta: {
              //     title: 'Message center ',
              //     icon: 'ep:chat-dot-round',
              //     hidden: false,
              //     noCache: false,
              //     alwaysShow: true
              //   },
              //   children: [
              //     {
              //       path: 'notify',
              //       name: 'Notify',
              //       meta: {
              //         title: 'On-site information management ',
              //         icon: 'ep:message-box',
              //         hidden: false,
              //         noCache: false,
              //         alwaysShow: true
              //       },
              //       children: [
              //         {
              //           path: 'notify-template',
              //           name: 'SystemNotifyTemplate',
              //           meta: {
              //             title: 'Template management ',
              //             icon: 'fa:archive',
              //             hidden: false,
              //             noCache: false,
              //             alwaysShow: null
              //           }
              //         },
              //         {
              //           path: 'notify-message',
              //           name: 'SystemNotifyMessage',
              //           meta: {
              //             title: 'Message record ',
              //             icon: 'fa:edit',
              //             hidden: false,
              //             noCache: false,
              //             alwaysShow: null
              //           }
              //         }
              //       ]
              //     }
              //   ]
              // }
            ]
          }
        ]
      } else {
        return unref(layout) === 'cutMenu'
          ? permissionStore.getMenuTabRouters
          : permissionStore.getRouters
      }
    })

    console.log('routers', JSON.stringify(routers.value))

    const collapse = computed(() => appStore.getCollapse)

    const uniqueOpened = computed(() => appStore.getUniqueOpened)

    const activeMenu = computed(() => {
      const { meta, path } = unref(currentRoute)
      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu as string
      }
      return path
    })

    const menuSelect = (index: string) => {
      if (props.menuSelect) {
        props.menuSelect(index)
      }
      // 自定义事件
      if (isUrl(index)) {
        window.open(index)
      } else {
        push(index)
      }
    }

    const renderMenuWrap = () => {
      if (unref(layout) === 'top') {
        return renderMenu()
      } else {
        return <ElScrollbar>{renderMenu()}</ElScrollbar>
      }
    }

    const renderMenu = () => {
      return (
        <ElMenu
          defaultActive={unref(activeMenu)}
          mode={unref(menuMode)}
          collapse={
            unref(layout) === 'top' || unref(layout) === 'cutMenu' ? false : unref(collapse)
          }
          uniqueOpened={unref(layout) === 'top' ? false : unref(uniqueOpened)}
          popperClass={
            unref(menuMode) === 'vertical' ? `${prefixCls}-popper--vertical` : `custom-popup`
          }
          backgroundColor={
            unref(menuMode) === 'vertical' ? 'var(--left-menu-bg-color)' : 'transparent'
          }
          textColor={unref(menuMode) === 'vertical' ? 'var(--left-menu-text-color)' : '#fff'}
          activeTextColor={
            unref(menuMode) === 'vertical' ? 'var(--left-menu-text-active-color)' : '#00ccff'
          }
          class={unref(menuMode) === 'vertical' ? '' : 'custom-menu'}
          onSelect={menuSelect}
        >
          {{
            default: () => {
              const { renderMenuItem } = useRenderMenuItem(unref(menuMode))

              return renderMenuItem(unref(routers))
            }
          }}
        </ElMenu>
      )
    }

    return () => (
      <div id={prefixCls} class="menu">
        {renderMenuWrap()}
      </div>
    )
  }
})
</script>

<style lang="scss" scoped>
$prefix-cls: #{$namespace}-menu;

.#{$prefix-cls} {
  position: relative;
  transition: width var(--transition-time-02);

  :deep(.#{$elNamespace}-menu) {
    width: 100% !important;
    border-right: none;

    // 设置选中时子标题的颜色
    .is-active {
      & > .#{$elNamespace}-sub-menu__title {
        color: var(--left-menu-text-active-color) !important;
      }
    }

    // 设置子菜单悬停的高亮和背景色
    .#{$elNamespace}-sub-menu__title,
    .#{$elNamespace}-menu-item {
      &:hover {
        background: var(--default-btn-bg-active) !important;
        color: var(--default-btn-bg-active-font-color) !important;
      }
    }

    // 设置选中时的高亮背景和高亮颜色
    .#{$elNamespace}-menu-item.is-active {
      color: var(--left-menu-text-active-color) !important;
      background-color: var(--left-menu-bg-active-color) !important;

      &:hover {
        background-color: var(--left-menu-bg-active-color) !important;
      }
    }

    .#{$elNamespace}-menu-item.is-active {
      position: relative;
    }

    // 设置子菜单的背景颜色
    .#{$elNamespace}-menu {
      .#{$elNamespace}-sub-menu__title,
      .#{$elNamespace}-menu-item:not(.is-active) {
        background-color: var(--default-main-color) !important;
      }
    }
  }

  // 折叠时的最小宽度
  :deep(.#{$elNamespace}-menu--collapse) {
    width: var(--left-menu-min-width);

    & > .is-active,
    & > .is-active > .#{$elNamespace}-sub-menu__title {
      position: relative;
      background-color: var(--left-menu-collapse-bg-active-color) !important;
    }
  }

  // 折叠动画的时候，就需要把文字给隐藏掉
  :deep(.horizontal-collapse-transition) {
    // transition: 0s width ease-in-out, 0s padding-left ease-in-out, 0s padding-right ease-in-out !important;
    .#{$prefix-cls}__title {
      display: none;
    }
  }

  // 垂直菜单
  &__vertical {
    :deep(.#{$elNamespace}-menu--vertical) {
      &:not(.#{$elNamespace}-menu--collapse) .#{$elNamespace}-sub-menu__title,
      .#{$elNamespace}-menu-item {
        padding-right: 0;
      }
    }
  }

  // 水平菜单
  &__horizontal {
    height: calc(var(--top-tool-height)) !important;

    :deep(.#{$elNamespace}-menu--horizontal) {
      height: calc(var(--top-tool-height));
      border-bottom: none;
      // 重新设置底部高亮颜色
      & > .#{$elNamespace}-sub-menu.is-active {
        .#{$elNamespace}-sub-menu__title {
          border-bottom-color: var(--default-main-color) !important;
        }
      }

      .#{$elNamespace}-menu-item.is-active {
        position: relative;

        &::after {
          display: none !important;
        }
      }

      .#{$prefix-cls}__title {
        /* stylelint-disable-next-line */
        max-height: calc(var(--top-tool-height) - 2px) !important;
        /* stylelint-disable-next-line */
        line-height: calc(var(--top-tool-height) - 2px);
      }
    }
  }
}

.menu {
  display: flex;
  justify-content: flex-start;
  flex: 1;
  max-width: 68%;
  min-width: 60%;
}

.custom-menu {
  border-bottom: none !important;
  height: 50px;
  min-width: 0;
}

.el-menu--horizontal > .el-menu-item.is-active {
  border-bottom-color: transparent;
}

.custom-menu .v-icon {
  display: none;
}

:deep(.custom-menu .el-sub-menu__icon-more):before {
  //: 'More'!important;
}

.custom-menu .el-menu-item {
  font-weight: 500;
  padding: 0 15px;
  margin: 0 5px;
  font-size: 1rem;
  color: #fff !important;
  transition:
    color 0.3s,
    background-color 0.3s;
}

.custom-menu .el-menu-item:hover {
  background: var(--default-btn-bg-active) !important;
  color: var(--default-btn-bg-active-font-color) !important;
}

.custom-menu .el-sub-menu:hover {
  background: var(--default-btn-bg-active) !important;
  color: var(--default-btn-bg-active-font-color) !important;
}

.custom-menu .el-menu-item.is-active {
  color: #ffffff !important;
  border-bottom: 2px solid transparent;
}

:deep(.el-sub-menu__title:hover) {
  background: var(--default-btn-bg-active) !important;
  color: var(--default-btn-bg-active-font-color) !important;
}

.custom-menu .el-menu-item.is-active {
  background: var(--default-btn-bg-active) !important;
  color: var(--default-btn-bg-active-font-color) !important;
}

.custom-menu .el-menu--horizontal > .el-sub-menu.is-active .el-sub-menu__title {
  color: var(--default-btn-bg-active-font-color) !important;
}

.custom-menu .el-menu--horizontal > .el-sub-menu.is-active .el-sub-menu__title {
  background: var(--default-btn-bg-active) !important;
  color: var(--default-btn-bg-active-font-color) !important;
}

:deep(.el-sub-menu.is-active .el-sub-menu__title) {
  background: var(--default-btn-bg-active) !important;
  color: var(--default-btn-bg-active-font-color) !important;
}

.el-menu-item {
  display: flex;

  .el-icon {
    display: none;
  }
}

.el-sub-menu .el-icon {
  display: none;
}
</style>

<style lang="scss">
$prefix-cls: #{$namespace}-menu-popper;

.#{$prefix-cls}--vertical,
.#{$prefix-cls}--horizontal {
  // 设置选中时子标题的颜色
  .is-active {
    & > .el-sub-menu__title {
      color: var(--left-menu-text-active-color) !important;
    }
  }

  // 设置子菜单悬停的高亮和背景色
  .el-sub-menu__title,
  .el-menu-item {
    &:hover {
      background: var(--default-btn-bg-active) !important;
      color: var(--default-btn-bg-active-font-color) !important;
    }
  }

  // 设置选中时的高亮背景
  .el-menu-item.is-active {
    position: relative;
    background-color: var(--default-main-color) !important;

    &:hover {
      background-color: var(--left-menu-bg-active-color) !important;
    }
  }
}

.dark {
  .custom-popup {
    .el-menu {
      background-color: rgba(0, 0, 0, 0.9) !important;
    }
  }
}

.custom-popup {
  .el-menu {
    background-color: #435080;
    border-color: #435080;
  }

  .el-menu--horizontal .el-menu-item:not(.is-disabled):hover {
    background: var(--default-btn-bg-active) !important;
    color: var(--default-btn-bg-active-font-color) !important;
  }
}
</style>
