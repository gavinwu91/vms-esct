<script lang="tsx">
import { defineComponent, computed } from 'vue'
import { Message } from '@/layout/components//Message'
import { Collapse } from '@/layout/components/Collapse'
import { UserInfo } from '@/layout/components/UserInfo'
import { Screenfull } from '@/layout/components/Screenfull'
import { Breadcrumb } from '@/layout/components/Breadcrumb'
import { SizeDropdown } from '@/layout/components/SizeDropdown'
import { LocaleDropdown } from '@/layout/components/LocaleDropdown'
import RouterSearch from '@/components/RouterSearch/index.vue'
import TenantVisit from '@/layout/components/TenantVisit/index.vue'
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'
import { checkPermi } from '@/utils/permission'
import { ThemeSwitch } from '@/layout/components/ThemeSwitch'

const { getPrefixCls, variables } = useDesign()

const prefixCls = getPrefixCls('tool-header')

const appStore = useAppStore()

// 面包屑
const breadcrumb = computed(() => appStore.getBreadcrumb)

// 折叠图标
const hamburger = computed(() => appStore.getHamburger)

// 全屏图标
const screenfull = computed(() => appStore.getScreenfull)

// 搜索图片
const search = computed(() => appStore.search)

// 尺寸图标
const size = computed(() => appStore.getSize)

// 布局
const layout = computed(() => appStore.getLayout)

// 多语言图标
const locale = computed(() => appStore.getLocale)

// 消息图标
const message = computed(() => appStore.getMessage)

// 租户切换权限
const hasTenantVisitPermission = computed(
  () => import.meta.env.VITE_APP_TENANT_ENABLE === 'true' && checkPermi(['system:tenant:visit'])
)

export default defineComponent({
  name: 'ToolHeader',
  setup() {
    return () => (
      <div
        id={`${variables.namespace}-tool-header`}
        class={[
          prefixCls,
          'h-[var(--top-tool-height)] relative px-[var(--top-tool-p-x)] flex items-center justify-between my-tool',
          'dark:bg-[var(--el-bg-color)]'
        ]}
      >
        {layout.value !== 'top' && layout.value !== 'vmsUi' ? (
          <div class="h-full flex items-center">
            {hamburger.value && layout.value !== 'cutMenu' ? (
              <Collapse class="custom-hover" color="#fff"></Collapse>
            ) : undefined}
            {breadcrumb.value ? <Breadcrumb class="lt-md:hidden"></Breadcrumb> : undefined}
          </div>
        ) : undefined}
        <div class="h-full flex items-center">
          {screenfull.value ? (
            <Screenfull class="custom-hover" color="#fff"></Screenfull>
          ) : undefined}

          {size.value ? <SizeDropdown class="custom-hover" color="#fff"></SizeDropdown> : undefined}
          {locale.value ? (
            <LocaleDropdown class="custom-hover" color="#fff"></LocaleDropdown>
          ) : undefined}
          {message.value ? <Message class="custom-hover" color="#fff"></Message> : undefined}

          <UserInfo></UserInfo>
        </div>
      </div>
    )
  }
})

// <div class="h-full flex items-center">
//   <ThemeSwitch />
// {message.value ? (
//             <Message class="custom-hover" color="#fff"></Message>
//           ) : undefined}
</script>

<style lang="scss" scoped>
$prefix-cls: #{$namespace}-tool-header;

.#{$prefix-cls} {
  transition: all 0.2s;
  background: transparent;

  /* 通用按钮容器 */
  :deep(.custom-hover) {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    height: 28px !important; /* 调整高度以匹配 Tab */
    padding: 0 8px !important;
    margin: 0 2px !important;
    border-radius: 6px !important;
    cursor: pointer;
    transition: all 0.2s;
    color: #94a3b8;

    &:hover {
      background: rgba(56, 189, 248, 0.12);
      color: #38bdf8;

      .el-icon,
      svg {
        color: #38bdf8 !important;
      }
    }

    .el-icon,
    svg {
      font-size: 14px !important;
      width: 14px !important;
      height: 14px !important;
      color: #94a3b8;
    }
  }
}

/* 用户信息特殊处理 */
:deep(.v-user-info) {
  span {
    font-size: 12px;
    color: #94a3b8;
    margin-left: 5px;
  }
  &:hover span {
    color: #38bdf8;
  }
}
</style>
