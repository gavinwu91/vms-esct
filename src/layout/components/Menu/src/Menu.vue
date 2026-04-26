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

<style lang="scss" scoped>
$prefix-cls: #{$namespace}-menu;

.#{$prefix-cls} {
  position: relative;
  transition: width var(--transition-time-02);

  :deep(.#{$elNamespace}-menu) {
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

    // 选中/高亮逻辑（由变量控制）
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

  // 针对 vmsUi 布局的内联优化
  &__vmsUi {
    :deep(.#{$elNamespace}-menu) {
      padding: 0 !important;

      .#{$elNamespace}-menu-item,
      .#{$elNamespace}-sub-menu__title {
        height: 32px !important; 
        line-height: 32px !important;
        padding: 0 12px !important;
        margin: 1px 8px !important; /* 缩小上下间距从 4px 到 1px */
        border-radius: 8px !important;
        font-size: 13px !important;
        gap: 12px !important;
        box-sizing: border-box !important;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;

        // 图标优化
        .el-icon {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 20px !important;
          height: 20px !important;
          font-size: 16px !important;
          margin: 0 !important;
          flex-shrink: 0 !important;
        }
      }

      .#{$elNamespace}-menu-item.is-active {
        border-right: 2px solid #38bdf8 !important;
        background: linear-gradient(135deg, rgba(34, 211, 238, 0.12), rgba(14, 165, 233, 0.08)) !important;
      }

      // 折叠状态下的优化 — 严格对标 vms-ui
      &.#{$elNamespace}-menu--collapse {
        width: 100% !important;

        .#{$elNamespace}-menu-item,
        .#{$elNamespace}-sub-menu__title {
          height: 32px !important;
          line-height: 32px !important;
          margin: 1px 10px !important; /* 缩小上下间距从 4px 到 1px */
          justify-content: center !important;
          box-sizing: border-box !important;

          // 强制锁定折叠态图标大小，防止跳变
          .el-icon {
            width: 20px !important;
            height: 20px !important;
            font-size: 16px !important;
            display: inline-flex !important;
          }

          // 只隐藏文字标题和箭头，不隐藏图标 (Icon 内部可能包含 span)
          .v-menu__title, 
          .#{$elNamespace}-sub-menu__icon-arrow {
            display: none !important;
          }
        }

        .#{$elNamespace}-menu-item.is-active {
          border-right: 2px solid #38bdf8 !important; /* 恢复发光边框 */
          background: rgba(34, 211, 238, 0.15) !important;
        }
      }

      // 子菜单内层缩进
      .#{$elNamespace}-menu {
        .#{$elNamespace}-menu-item,
        .#{$elNamespace}-sub-menu__title {
          padding-left: 20px !important;
          font-size: 12px !important;
          color: #7c8fa3 !important;
        }

        .#{$elNamespace}-menu-item.is-active {
          border-right: 2px solid rgba(56, 189, 248, 0.5) !important;
          background: rgba(34, 211, 238, 0.1) !important;
        }
      }
    }
  }

  // 折叠时的最小宽度
  :deep(.#{$elNamespace}-menu--collapse) {
    width: 100% !important;

    & > .is-active,
    & > .is-active > .#{$elNamespace}-sub-menu__title {
      position: relative;
      background-color: var(--left-menu-collapse-bg-active-color) !important;
    }
  }

  // 折叠动画
  :deep(.horizontal-collapse-transition) {
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
      & > .#{$elNamespace}-sub-menu.is-active {
        .#{$elNamespace}-sub-menu__title {
          border-bottom-color: var(--default-main-color) !important;
        }
      }
    }
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

.el-menu-item {
  display: flex;
}
</style>

<style lang="scss">
$prefix-cls: #{$namespace}-menu-popper;

// popper 样式已统一在 vms-ui.scss 中处理
.#{$prefix-cls}--vertical,
.#{$prefix-cls}--horizontal {
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
