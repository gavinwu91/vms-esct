<script lang="tsx">
import {computed, defineComponent, unref} from 'vue'
import {useAppStore} from '@/store/modules/app'
import {Backtop} from '@/components/Backtop'
import {Setting} from '@/layout/components/Setting'
import {useRenderLayout} from './components/useRenderLayout'
import {useDesign} from '@/hooks/web/useDesign'
import * as authUtil from '@/utils/auth'
import {setCssVar, trim} from '@/utils'

const {getPrefixCls} = useDesign()

const prefixCls = getPrefixCls('layout')

const appStore = useAppStore()

// 是否是移动端
const mobile = computed(() => appStore.getMobile)

// 菜单折叠
const collapse = computed(() => appStore.getCollapse)

const layout = computed(() => appStore.getLayout)


const handleClickOutside = () => {
  appStore.setCollapse(true)
}

const renderLayout = () => {
  // const tenantid = authUtil.getTenantId();
  // if (tenantid === -1) {
  //   let scheme = {"elColorPrimary":"#009688","topHeaderBgColor":"#009688","topHeaderTextColor":"#fff","topHeaderHoverColor":"#0fa597","topToolBorderColor":"#009688","leftMenuBorderColor":"inherit","leftMenuBgColor":"#009688","leftMenuBgLightColor":"#0fa597","leftMenuBgActiveColor":"var(--el-color-primary)","leftMenuCollapseBgActiveColor":"var(--el-color-primary)","leftMenuTextColor":"#bfcbd9","leftMenuTextActiveColor":"#fff","logoTitleTextColor":"#fff","logoBorderColor":"#009688"};
  //   appStore.setTheme(scheme);
  //   appStore.setIsDark(false)
  //   appStore.setCssVarTheme()
  //   appStore.setLayout('top')
  // }
  // else if (tenantid === 165) {
  //   let scheme = {"topHeaderBgColor":"#fff","topHeaderTextColor":"inherit","topHeaderHoverColor":"#f6f6f6","topToolBorderColor":"#eee","leftMenuBorderColor":"inherit","leftMenuBgColor":"#001529","leftMenuBgLightColor":"#0f2438","leftMenuBgActiveColor":"var(--el-color-primary)","leftMenuCollapseBgActiveColor":"var(--el-color-primary)","leftMenuTextColor":"#bfcbd9","leftMenuTextActiveColor":"#fff","logoTitleTextColor":"#fff","logoBorderColor":"#001529"};
  //   appStore.setTheme(scheme);
  //   appStore.setIsDark(false)
  //   appStore.setCssVarTheme()
  //   appStore.setLayout('classic')
  // }
  // else if (tenantid === 166) {
  //   let scheme = {"topHeaderBgColor":"#394664","topHeaderTextColor":"#fff","topHeaderHoverColor":"#485573","topToolBorderColor":"#394664","leftMenuBorderColor":"inherit","leftMenuBgColor":"#212121","leftMenuBgLightColor":"#303030","leftMenuBgActiveColor":"var(--el-color-primary)","leftMenuCollapseBgActiveColor":"var(--el-color-primary)","leftMenuTextColor":"#bfcbd9","leftMenuTextActiveColor":"#fff","logoTitleTextColor":"#fff","logoBorderColor":"#212121"};
  //   appStore.setTheme(scheme);
  //   appStore.setIsDark(true)
  //   appStore.setCssVarTheme()
  //   appStore.setLayout('topLeft')
  // }
  appStore.setCurrentSize('default')
  const { renderClassic, renderTopLeft, renderTop, renderCutMenu, renderVmsUi } = useRenderLayout()
  
  switch (unref(layout)) {
    case 'classic':
      return renderClassic()
    case 'topLeft':
      return renderTopLeft()
    case 'top':
      return renderTop()
    case 'cutMenu':
      return renderCutMenu()
    case 'vmsUi':
      return renderVmsUi()
    default:
      return renderVmsUi()
  }
}

export default defineComponent({
  name: 'Layout',
  setup() {
    return () => (
      <section class={[prefixCls, `${prefixCls}__${layout.value}`, 'w-[100%] h-[100%] relative']}>
        {mobile.value && !collapse.value ? (
          <div
            class="absolute left-0 top-0 z-99 h-full w-full bg-[var(--el-color-black)] opacity-30"
            onClick={handleClickOutside}
          ></div>
        ) : undefined}

        {renderLayout()}

        <Backtop></Backtop>

      </section>
    )
  }
})
</script>

<style lang="scss" scoped>

$prefix-cls: #{$namespace}-layout;

.#{$prefix-cls} {
  background-color: var(--app-content-bg-color);
}

.dark {
  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    //background: linear-gradient(to right, #000, #525253 50%, #000);
    background: var(--top-bar-bg);
    color: #fff !important;
    padding: 0 0 0 10px;
    height: var(--top-bar-hight);
    font-size: var(--top-bar-font-size);
    border-bottom: 1px solid transparent;
    box-shadow: 0 2px 4px rgba(0, 128, 255, 0.1);

    :deep(.v-tool-header) {
      background-color: unset !important;;
    }

    :deep(.custom-hover:hover) {
      background-color: var(--default-btn-bg-active);
    }
  }

  .v-layout{
    background: var(--el-bg-color) !important;
  }
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  //background: linear-gradient(to right, #0d2a4a, #2b4d75 50%, #0d2a4a);
  //background: linear-gradient(to right, #263e5f, #223d5a 50%, #27507c, #133458);
  background: var(--top-bar-bg);
  color: #fff !important;
  padding: 0 0 0 10px;
  height: var(--top-bar-hight);
  font-size: var(--top-bar-font-size);
  border-bottom: 1px solid transparent;
  box-shadow: 0 2px 4px rgba(0, 128, 255, 0.1);

}


</style>
