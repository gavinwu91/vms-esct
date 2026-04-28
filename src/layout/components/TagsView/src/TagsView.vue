<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, unref, watch } from 'vue'
import type { RouteLocationNormalizedLoaded, RouterLinkProps } from 'vue-router'
import { useRouter } from 'vue-router'
import { usePermissionStore } from '@/store/modules/permission'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useAppStore } from '@/store/modules/app'
import { useI18n } from '@/hooks/web/useI18n'
import { filterAffixTags } from './helper'
import { ContextMenu, ContextMenuExpose } from '@/layout/components/ContextMenu'
import { useDesign } from '@/hooks/web/useDesign'
import { useTemplateRefsList } from '@vueuse/core'
import { ElScrollbar } from 'element-plus'
import { useScrollTo } from '@/hooks/event/useScrollTo'
import { useTagsView } from '@/hooks/web/useTagsView'
import { cloneDeep } from 'lodash-es'

defineOptions({ name: 'TagsView' })

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('tags-view')

const { t } = useI18n()

const { currentRoute, push } = useRouter()

const { closeAll, closeLeft, closeRight, closeOther, closeCurrent, refreshPage } = useTagsView()

const permissionStore = usePermissionStore()

const routers = computed(() => permissionStore.getRouters)

const tagsViewStore = useTagsViewStore()

const visitedViews = computed(() => tagsViewStore.getVisitedViews)

const affixTagArr = ref<RouteLocationNormalizedLoaded[]>([])

const selectedTag = computed(() => tagsViewStore.getSelectedTag)

const setSelectTag = tagsViewStore.setSelectedTag

const appStore = useAppStore()

const tagsViewImmerse = computed(() => appStore.getTagsViewImmerse)

const tagsViewIcon = computed(() => appStore.getTagsViewIcon)

const isDark = computed(() => appStore.getIsDark)

// 初始化tag
const initTags = () => {
  affixTagArr.value = filterAffixTags(unref(routers))
  for (const tag of unref(affixTagArr)) {
    // Must have tag name
    if (tag.name) {
      tagsViewStore.addVisitedView(cloneDeep(tag))
    }
  }
}

// 新增tag
const addTags = () => {
  const { name } = unref(currentRoute)
  if (name) {
    setSelectTag(unref(currentRoute))
    tagsViewStore.addView(unref(currentRoute))
  }
}

// 关闭选中的tag
const closeSelectedTag = (view: RouteLocationNormalizedLoaded) => {
  closeCurrent(view, () => {
    if (isActive(view)) {
      toLastView()
    }
  })
}

// 去最后一个
const toLastView = () => {
  const visitedViews = tagsViewStore.getVisitedViews
  const latestView = visitedViews.slice(-1)[0]
  if (latestView) {
    push(latestView)
  } else {
    if (
      unref(currentRoute).path === permissionStore.getAddRouters[0].path ||
      unref(currentRoute).path === permissionStore.getAddRouters[0].redirect
    ) {
      addTags()
      return
    }
    // You can set another route
    push(permissionStore.getAddRouters[0].path)
  }
}

// 关闭全部
const closeAllTags = () => {
  closeAll(() => {
    toLastView()
  })
}

// 关闭其它
const closeOthersTags = () => {
  closeOther()
}

// 重新加载
const refreshSelectedTag = async (view?: RouteLocationNormalizedLoaded) => {
  refreshPage(view)
}

// 关闭左侧
const closeLeftTags = () => {
  closeLeft()
}

// 关闭右侧
const closeRightTags = () => {
  closeRight()
}

// 滚动到选中的tag
const moveToCurrentTag = async () => {
  await nextTick()
  for (const v of unref(visitedViews)) {
    if (v.fullPath === unref(currentRoute).fullPath) {
      moveToTarget(v)
      break
    }
  }
}

const tagLinksRefs = useTemplateRefsList<RouterLinkProps>()

const moveToTarget = (currentTag: RouteLocationNormalizedLoaded) => {
  const wrap$ = unref(scrollbarRef)?.wrapRef
  let firstTag: Nullable<RouterLinkProps> = null
  let lastTag: Nullable<RouterLinkProps> = null

  const tagList = unref(tagLinksRefs)
  // find first tag and last tag
  if (tagList.length > 0) {
    firstTag = tagList[0]
    lastTag = tagList[tagList.length - 1]
  }
  if ((firstTag?.to as RouteLocationNormalizedLoaded).fullPath === currentTag.fullPath) {
    // 直接滚动到0的位置
    const { start } = useScrollTo({
      el: wrap$!,
      position: 'scrollLeft',
      to: 0,
      duration: 500
    })
    start()
  } else if ((lastTag?.to as RouteLocationNormalizedLoaded).fullPath === currentTag.fullPath) {
    // 滚动到最后的位置
    const { start } = useScrollTo({
      el: wrap$!,
      position: 'scrollLeft',
      to: wrap$!.scrollWidth - wrap$!.offsetWidth,
      duration: 500
    })
    start()
  } else {
    // find preTag and nextTag
    const currentIndex: number = tagList.findIndex(
      (item) => (item?.to as RouteLocationNormalizedLoaded).fullPath === currentTag.fullPath
    )
    const tgsRefs = document.getElementsByClassName(`${prefixCls}__item`)

    const prevTag = tgsRefs[currentIndex - 1] as HTMLElement
    const nextTag = tgsRefs[currentIndex + 1] as HTMLElement

    // the tag's offsetLeft after of nextTag
    const afterNextTagOffsetLeft = nextTag.offsetLeft + nextTag.offsetWidth + 4

    // the tag's offsetLeft before of prevTag
    const beforePrevTagOffsetLeft = prevTag.offsetLeft - 4

    if (afterNextTagOffsetLeft > unref(scrollLeftNumber) + wrap$!.offsetWidth) {
      const { start } = useScrollTo({
        el: wrap$!,
        position: 'scrollLeft',
        to: afterNextTagOffsetLeft - wrap$!.offsetWidth,
        duration: 500
      })
      start()
    } else if (beforePrevTagOffsetLeft < unref(scrollLeftNumber)) {
      const { start } = useScrollTo({
        el: wrap$!,
        position: 'scrollLeft',
        to: beforePrevTagOffsetLeft,
        duration: 500
      })
      start()
    }
  }
}

// 是否是当前tag
const isActive = (route: RouteLocationNormalizedLoaded): boolean => {
  return route.fullPath === unref(currentRoute).fullPath
}

// 所有右键菜单组件的元素
const itemRefs = useTemplateRefsList<ComponentRef<typeof ContextMenu & ContextMenuExpose>>()

// 右键菜单 Status改变的时候
const visibleChange = (visible: boolean, tagItem: RouteLocationNormalizedLoaded) => {
  if (visible) {
    for (const v of unref(itemRefs)) {
      const elDropdownMenuRef = v.elDropdownMenuRef
      if (tagItem.fullPath !== v.tagItem.fullPath) {
        elDropdownMenuRef?.handleClose()
        setSelectTag(tagItem)
      }
    }
  }
}

// elscroll 实例
const scrollbarRef = ref<ComponentRef<typeof ElScrollbar>>()

// 保存滚动位置
const scrollLeftNumber = ref(0)

const scroll = ({ scrollLeft }) => {
  scrollLeftNumber.value = scrollLeft as number
}

// 移动到某个位置
const move = (to: number) => {
  const wrap$ = unref(scrollbarRef)?.wrapRef
  const { start } = useScrollTo({
    el: wrap$!,
    position: 'scrollLeft',
    to: unref(scrollLeftNumber) + to,
    duration: 500
  })
  start()
}

const canShowIcon = (item: RouteLocationNormalizedLoaded) => {
  if (
    (item?.matched?.[1]?.meta?.icon && unref(tagsViewIcon)) ||
    (item?.meta?.affix && unref(tagsViewIcon) && item?.meta?.icon)
  ) {
    return true
  }
  return false
}

onBeforeMount(() => {
  initTags()
  addTags()
})

watch(
  () => currentRoute.value,
  () => {
    addTags()
    moveToCurrentTag()
  }
)
</script>

<template>
  <div
    :id="prefixCls"
    :class="prefixCls"
    class="relative w-full flex items-center"
  >
    <span
      :class="tagsViewImmerse ? '' : `${prefixCls}__tool ${prefixCls}__tool--first`"
      class="flex cursor-pointer items-center justify-center"
      @click="move(-200)"
    >
      <Icon
        :hover-color="isDark ? '#fff' : 'var(--el-color-black)'"
        color="var(--el-text-color-placeholder)"
        icon="ep:d-arrow-left"
      />
    </span>
    <div class="flex-1 overflow-hidden">
      <ElScrollbar ref="scrollbarRef" class="h-full" @scroll="scroll">
        <div class="h-[var(--tags-view-height)] flex items-center">
          <ContextMenu
            v-for="item in visitedViews"
            :key="item.fullPath"
            :ref="itemRefs.set"
            :class="[
              `${prefixCls}__item`,
              tagsViewImmerse ? `${prefixCls}__item--immerse` : '',
              tagsViewIcon ? `${prefixCls}__item--icon` : '',
              tagsViewImmerse && tagsViewIcon ? `${prefixCls}__item--immerse--icon` : '',
              item?.meta?.affix ? `${prefixCls}__item--affix` : '',
              {
                'is-active': isActive(item)
              }
            ]"
            :schema="[
              {
                icon: 'ep:refresh',
                label: t('common.reload'),
                disabled: selectedTag?.fullPath !== item.fullPath,
                command: () => {
                  refreshSelectedTag(item)
                }
              },
              {
                icon: 'ep:close',
                label: t('common.closeTab'),
                disabled: !!visitedViews?.length && selectedTag?.meta.affix,
                command: () => {
                  closeSelectedTag(item)
                }
              },
              {
                divided: true,
                icon: 'ep:d-arrow-left',
                label: t('common.closeTheLeftTab'),
                disabled:
                  !!visitedViews?.length &&
                  (item.fullPath === visitedViews[0].fullPath ||
                    selectedTag?.fullPath !== item.fullPath),
                command: () => {
                  closeLeftTags()
                }
              },
              {
                icon: 'ep:d-arrow-right',
                label: t('common.closeTheRightTab'),
                disabled:
                  !!visitedViews?.length &&
                  (item.fullPath === visitedViews[visitedViews.length - 1].fullPath ||
                    selectedTag?.fullPath !== item.fullPath),
                command: () => {
                  closeRightTags()
                }
              },
              {
                divided: true,
                icon: 'ep:discount',
                label: t('common.closeOther'),
                disabled: selectedTag?.fullPath !== item.fullPath,
                command: () => {
                  closeOthersTags()
                }
              },
              {
                icon: 'ep:minus',
                label: t('common.closeAll'),
                command: () => {
                  closeAllTags()
                }
              }
            ]"
            :tag-item="item"
            @visible-change="visibleChange"
          >
            <div class="h-full flex items-center">
              <router-link :ref="tagLinksRefs.set" v-slot="{ navigate }" :to="{ ...item }" custom>
                <div
                  :class="`h-full flex items-center justify-center whitespace-nowrap px-10px ${prefixCls}__item--label`"
                  @click="navigate"
                >
                  <Icon
                    v-if="
                      tagsViewIcon &&
                      (item?.meta?.icon ||
                        (item?.matched &&
                          item.matched[0] &&
                          item.matched[item.matched.length - 1].meta?.icon))
                    "
                    :icon="item?.meta?.icon || item.matched[item.matched.length - 1].meta.icon"
                    :size="12"
                    class="mr-5px"
                  />
                  {{
                    t(item?.meta?.title as string) +
                    (item?.meta?.titleSuffix ? ` (${item?.meta?.titleSuffix})` : '')
                  }}
                  <Icon
                    v-if="!item?.meta?.affix"
                    :class="`${prefixCls}__item--close`"
                    :size="12"
                    color="#38bdf8"
                    icon="ep:close"
                    @click.prevent.stop="closeSelectedTag(item)"
                  />
                </div>
              </router-link>
            </div>
          </ContextMenu>
        </div>
      </ElScrollbar>
    </div>
    <span
      v-if="visitedViews.length > 5"
      :class="tagsViewImmerse ? '' : `${prefixCls}__tool`"
      class="flex cursor-pointer items-center justify-center"
      @click="move(200)"
    >
      <Icon
        :hover-color="isDark ? '#fff' : 'var(--el-color-black)'"
        color="var(--el-text-color-placeholder)"
        icon="ep:d-arrow-right"
      />
    </span>
    <span
      :class="tagsViewImmerse ? '' : `${prefixCls}__tool`"
      class="flex cursor-pointer items-center justify-center"
      @click="refreshSelectedTag(selectedTag)"
    >
      <Icon
        :hover-color="isDark ? '#fff' : 'var(--el-color-black)'"
        color="var(--el-text-color-placeholder)"
        icon="ep:refresh-right"
      />
    </span>
    <ContextMenu
      :schema="[
        {
          icon: 'ep:refresh',
          label: t('common.reload'),
          command: () => {
            refreshSelectedTag(selectedTag)
          }
        },
        {
          icon: 'ep:close',
          label: t('common.closeTab'),
          disabled: !!visitedViews?.length && selectedTag?.meta.affix,
          command: () => {
            closeSelectedTag(selectedTag!)
          }
        },
        {
          divided: true,
          icon: 'ep:d-arrow-left',
          label: t('common.closeTheLeftTab'),
          disabled: !!visitedViews?.length && selectedTag?.fullPath === visitedViews[0].fullPath,
          command: () => {
            closeLeftTags()
          }
        },
        {
          icon: 'ep:d-arrow-right',
          label: t('common.closeTheRightTab'),
          disabled:
            !!visitedViews?.length &&
            selectedTag?.fullPath === visitedViews[visitedViews.length - 1].fullPath,
          command: () => {
            closeRightTags()
          }
        },
        {
          divided: true,
          icon: 'ep:discount',
          label: t('common.closeOther'),
          command: () => {
            closeOthersTags()
          }
        },
        {
          icon: 'ep:minus',
          label: t('common.closeAll'),
          command: () => {
            closeAllTags()
          }
        }
      ]"
      trigger="click"
    >
      <span
        :class="tagsViewImmerse ? '' : `${prefixCls}__tool`"
        class="block h-[var(--tags-view-height)] w-[var(--tags-view-height)] flex cursor-pointer items-center justify-center"
      >
        <Icon
          :hover-color="isDark ? '#fff' : 'var(--el-color-black)'"
          color="var(--el-text-color-placeholder)"
          icon="ep:menu"
        />
      </span>
    </ContextMenu>
  </div>
</template>

<style lang="scss">
$prefix-cls: #{$namespace}-tags-view;

/* 隐藏 tab 内标签图标（保持简洁） */
.#{$prefix-cls} {
  .#{$elNamespace}-scrollbar .v-tags-view__item--label .el-icon {
    display: none;
  }

  .#{$elNamespace}-scrollbar__view {
    height: 100%;
  }

  /* 右侧工具按钮 (刷新、更多等) */
  &__tool {
    position: relative;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    height: 32px !important;
    width: 32px !important;
    margin: 0 4px !important;
    border-radius: 50% !important; /* 改为圆型按钮更精致 */
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    color: #94a3b8;
    background: rgba(255, 255, 255, 0.03);

    &:hover {
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.2);
    }
  }

  /* ========== Tab 标签项 ========== */
  &__item {
    position: relative;
    height: 30px;
    line-height: 30px;
    padding-right: 25px; /* 预留给关闭按钮 */
    margin-left: 8px;
    font-size: 13px;
    cursor: pointer;
    border: 1px solid rgba(148, 163, 184, 0.1);
    border-radius: 15px; /* 全圆角胶囊风格 */
    box-sizing: border-box;
    background: rgba(30, 41, 59, 0.3);
    color: #94a3b8;
    transition: all 0.3s;

    &--close {
      position: absolute;
      top: 50%;
      right: 8px;
      display: none;
      transform: translateY(-50%);
      color: #64748b;
      &:hover { color: #ef4444 !important; }
    }

    &:hover {
      background: rgba(var(--vms-primary-rgb), 0.08);
      color: #e2e8f0;
      border-color: rgba(var(--vms-primary-rgb), 0.2);
      transition: var(--vms-transition);
      
      .#{$prefix-cls}__item--close { display: block; }
    }

    &.is-active {
      background: rgba(var(--vms-primary-rgb), 0.15);
      color: var(--vms-primary);
      border-color: rgba(var(--vms-primary-rgb), 0.4);
      box-shadow: var(--vms-glow);
      font-weight: 600;

      .#{$prefix-cls}__item--close {
        display: block;
        color: var(--vms-primary);
      }
    }
  }

  &__item--affix {
    padding-right: 15px !important;
  }
}

/* ========== VMS 标签页右键菜单 (全局覆盖但仅用于 TagsView) ========== */
.el-popper.is-light {
  background: rgba(8, 22, 45, 0.98) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(56, 189, 248, 0.25) !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.7) !important;
}

.el-dropdown-menu {
  background: transparent !important;
  padding: 4px 0 !important;
  border: none !important;
}

.el-dropdown-menu__item {
  position: relative !important;
  color: #a3b3cc !important;
  font-size: 13px !important;
  padding: 8px 20px !important;
  display: flex !important;
  align-items: center !important;
  background: transparent !important;
  outline: none !important;

  &::before {
    display: none !important;
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 2px;
    height: 100%;
    background: #38bdf8 !important;
    box-shadow: 0 0 8px #38bdf8 !important;
  }

  /* 仅鼠标真正悬停时触发强高亮，防止上下滑动时 focus 冲突 */
  &:hover {
    background: linear-gradient(90deg, rgba(56, 189, 248, 0.15) 0%, transparent 100%) !important;
    color: #38bdf8 !important;
    &::before { display: block !important; }
  }

  &:focus, &:focus-visible {
    background: rgba(56, 189, 248, 0.04) !important;
  }

  &.el-dropdown-menu__item--divided {
    border-top: 1px solid rgba(148, 163, 184, 0.1) !important;
    margin: 4px 0 !important;
    &::before { display: none !important; }
  }
}

/* ========== 顶部栏骨架 (由 vms-ui.scss 迁移至此) ========== */
.vms-ui-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  min-height: 44px;
  max-height: 44px;
  background: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(10px);
  border-radius: 22px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  margin-bottom: 8px;
}

.tabs-wrapper {
  overflow: hidden;
  display: flex;
  align-items: center;
  flex: 1;
  height: 100%;
  min-width: 0;
}
</style>
