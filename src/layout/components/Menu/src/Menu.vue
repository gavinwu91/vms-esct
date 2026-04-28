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
      return unref(layout) === 'cutMenu'
        ? permissionStore.getMenuTabRouters
        : permissionStore.getRouters
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
          backgroundColor="transparent"
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
      <div
        id={prefixCls}
        class={[
          prefixCls,
          'menu',
          unref(layout) === 'vmsUi' ? `${prefixCls}__vmsUi` : '',
          `${prefixCls}__${unref(menuMode)}`
        ]}
      >
        {renderMenuWrap()}
      </div>
    )
  }
})
</script>

<style lang="scss">
$prefix-cls: #{$namespace}-menu;

/* ========== VMS 科技风侧边栏菜单定制 (全局生效以确保穿透) ========== */
.#{$prefix-cls} {
  position: relative;
  transition: width var(--transition-time-02);
  width: 100% !important;

  // 重点修复：确保滚动条容器占满宽度
  .#{$elNamespace}-scrollbar {
    width: 100% !important;
    .#{$elNamespace}-scrollbar__view {
      width: 100% !important;
    }
  }

  .#{$elNamespace}-menu {
    width: 100% !important;
    border-right: none;
    background: transparent !important;

    // 统一菜单项基础样式
    .#{$elNamespace}-menu-item,
    .#{$elNamespace}-sub-menu__title {
      display: flex;
      align-items: center;
      transition: all 0.2s;
      border: none;
      box-sizing: border-box;
    }

    // 选中/高亮逻辑
    .is-active {
      & > .#{$elNamespace}-sub-menu__title {
        color: var(--left-menu-text-active-color) !important;
      }
    }

    .#{$elNamespace}-menu-item.is-active {
      color: var(--left-menu-text-active-color) !important;
      background-color: var(--left-menu-bg-active-color) !important;
    }
  }

  // 针对 vmsUi 布局的深度优化
  &.#{$prefix-cls}__vmsUi {
    width: 100% !important;
    flex: none !important;

    .#{$elNamespace}-menu {
      padding: 0 !important;
      width: 100% !important;

      .#{$elNamespace}-menu-item,
      .#{$elNamespace}-sub-menu__title {
        height: 44px !important;
        line-height: 44px !important;
        margin: 4px 8px !important; 
        border-radius: 10px !important;
        color: #94a3b8 !important;
        display: flex !important;
        align-items: center !important;
        position: relative !important;
        width: auto !important;

        .el-icon {
          font-size: 16px !important;
          margin-right: 12px !important;
          color: inherit !important;
          transition: var(--vms-transition);
        }

        &:hover {
          background: rgba(var(--vms-primary-rgb), 0.08) !important;
          color: var(--vms-primary) !important;
        }

        &.is-active {
          background: linear-gradient(90deg, rgba(var(--vms-primary-rgb), 0.15) 0%, rgba(var(--vms-primary-rgb), 0.05) 100%) !important;
          color: var(--vms-primary) !important;
          font-weight: 600;

          .el-icon {
            filter: drop-shadow(0 0 5px var(--vms-primary));
            animation: vms-icon-pulse 2s infinite ease-in-out;
          }
          
          /* 像素级还原 image.png：完整圆角边框，右侧发光 */
          &::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 10px;
            /* 四边都有边框但右边最亮 */
            border: 1px solid rgba(var(--vms-primary-rgb), 0.25);
            border-right: 2px solid var(--vms-primary-light);
            /* 右侧外发光 */
            box-shadow: 2px 0 8px rgba(var(--vms-primary-rgb), 0.6), 0 0 12px rgba(var(--vms-primary-rgb), 0.1);
            z-index: 1;
            pointer-events: none;
            animation: vms-fade-in 0.4s ease-out;
          }
        }
      }

      /* 修复子菜单箭头对齐问题 */
      .#{$elNamespace}-sub-menu__icon-arrow {
        position: absolute !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        margin-top: 0 !important;
        right: 12px !important;
        font-size: 14px !important;
        transition: transform 0.3s !important;
      }

      /* 展开后的二级菜单容器 */
      .#{$elNamespace}-menu--inline {
        background: rgba(0, 0, 0, 0.15) !important;
        padding: 4px 0 !important;
        margin: 0 8px !important;
        border-radius: 8px;
        width: auto !important;
      }

      /* 二级菜单项特有样式 - 同样使用胶囊圆弧 */
      .#{$elNamespace}-sub-menu .#{$elNamespace}-menu-item {
        height: 38px !important;
        line-height: 38px !important;
        padding-left: 45px !important;
        font-size: 13px !important;
        margin: 2px 0 !important;
        position: relative;
        width: 100% !important;
        border-radius: 6px !important; /* 恢复 6px 圆角 */

        &::before {
          display: none !important;
        }

        &:hover {
          background: rgba(56, 189, 248, 0.05) !important;
          padding-left: 48px !important;
        }

        &.is-active {
          background: rgba(var(--vms-primary-rgb), 0.1) !important;
          color: var(--vms-primary) !important;
          font-weight: 600;

          &::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 8px;
            border: 1px solid rgba(var(--vms-primary-rgb), 0.2);
            border-right: 2px solid var(--vms-primary-light);
            box-shadow: 2px 0 8px rgba(var(--vms-primary-rgb), 0.6), 0 0 10px rgba(var(--vms-primary-rgb), 0.1);
            animation: vms-fade-in 0.4s ease-out;
          }
        }
      }
    }
  }

  // 水平菜单模式
  &.#{$prefix-cls}__horizontal {
    height: calc(var(--top-tool-height)) !important;

    .#{$elNamespace}-menu--horizontal {
      height: calc(var(--top-tool-height));
      border-bottom: none;
      & > .#{$elNamespace}-sub-menu.is-active {
        .#{$elNamespace}-sub-menu__title {
          border-bottom-color: var(--default-main-color) !important;
        }
      }
    }
  }
}

/* 兼容折叠态下的图标显示 */
.vms-ui-sidebar.collapsed {
  .#{$elNamespace}-icon * {
    display: inline-block !important;
  }
  .#{$elNamespace}-sub-menu__icon-arrow {
    display: none !important;
  }
}

.menu {
  display: flex;
  justify-content: flex-start;
  flex: 1;
  width: 100%;
  min-width: 0;
}

.custom-menu {
  border-bottom: none !important;
  height: 50px;
  min-width: 0;
}

/* ========== VMS 科技风二级菜单弹出层 (Popper) ========== */
$popper-prefix-cls: #{$namespace}-menu-popper;

.#{$popper-prefix-cls}--vertical {
  background: rgba(8, 22, 45, 0.95) !important;
  border: 1px solid rgba(56, 189, 248, 0.25) !important;
  border-radius: 12px !important;
  backdrop-filter: blur(15px) !important;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6) !important;
  padding: 6px 0 !important;

  .el-menu,
  .el-menu--popup {
    background: transparent !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    min-width: 140px !important;
  }

  .el-menu-item,
  .el-sub-menu__title {
    height: 40px !important;
    line-height: 40px !important;
    margin: 2px 8px !important;
    padding: 0 14px !important;
    border-radius: 8px !important;
    color: #94a3b8 !important;
    font-size: 13px !important;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
    display: flex !important;
    align-items: center !important;

    .el-icon {
      font-size: 16px !important;
      margin-right: 10px !important;
      color: inherit !important;
    }

    &:hover {
      background: rgba(56, 189, 248, 0.12) !important;
      color: #38bdf8 !important;
    }

    &.is-active {
      background: rgba(14, 165, 233, 0.25) !important;
      color: #38bdf8 !important;
      font-weight: 600;
    }
  }

  /* 恢复并美化小箭头 */
  &.el-popper .el-popper__arrow {
    display: block !important;
    visibility: visible !important;

    &::before {
      background: rgba(8, 22, 45, 0.95) !important;
      border: 1px solid rgba(56, 189, 248, 0.25) !important;
      display: block !important;
      visibility: visible !important;
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

@keyframes vms-icon-pulse {
  0%, 100% { opacity: 1; transform: scale(1); filter: drop-shadow(0 0 5px var(--vms-primary)); }
  50% { opacity: 0.8; transform: scale(0.95); filter: drop-shadow(0 0 2px var(--vms-primary)); }
}

@keyframes vms-fade-in {
  from { opacity: 0; transform: translateX(-5px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
