<script setup lang="ts">
import {useAppStore} from "@/store/modules/app";
import {page} from "@/api/retrieval";
const fresh = ref(false);
const appStore = useAppStore()

onMounted(async () => {
  //隐藏标签
  appStore.setTagsView(false);
  fresh.value = true;

})

onUnmounted(() => {
  //组件清理之前  需要还原设置
  appStore.setTagsView(true)
})

</script>

<template>
  <div class="container">

  </div>
</template>

<style scoped lang="scss">
.container {
  display: flex;
  width: 100%;
  background: #435080;;
  overflow: hidden;
  height: calc(100vh - var(--top-tool-height));
}
</style>
