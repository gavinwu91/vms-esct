<script setup lang="ts">
import {faceSearchPermission} from "@/directives/permission/hasPermi";
defineOptions({name: 'FaceImagePermissions'})
const props = defineProps({
  elementType: {
    type: String,
    default: "el"
  },
  className: {
    type: String,
    default: "capture-image"
  },
  imagePath: {
    type: String,
  },
  placement: {
    type: String,
    default: "right"
  }

})


//权限相关
const facePermission = ref([]);
const router = useRouter()
const data = ref({});
const init = (remote) => {
  facePermission.value = faceSearchPermission();
  data.value = remote;
}

watch(() => props, (newData) => {
  init(newData)
})

onMounted(() => {
  init(props)
})


</script>
<template>
  <el-popover
    popper-class="custom-face-popover"
    :placement="props.placement"
    :disabled="facePermission.length===0">
    <div class="face-permission-menu">
      <div
        class="menu-item" :key="perindex"
        @click="router.push(pri.router +props.imagePath)"
        v-for="(pri,perindex) in facePermission"
        v-hasPermi="[pri.code]">{{ pri.name }}
      </div>
    </div>
    <template #reference>
      <el-image
        v-if="props.elementType==='el'"
        preview-teleported="true"
        hide-on-click-modal="true"
        :preview-src-list="[props.imagePath]"
        :class="props.className"
        :src="props.imagePath"
      />
      <div v-if="props.elementType==='el-div'">
        <div :class="props.className">
          <el-image :src="props.imagePath" v-if="props.imagePath"/>
          <el-image src="default_face.png" v-else/>
        </div>
      </div>
      <div :class="props.className" v-else>
        <img :src="props.imagePath" alt=""/>
      </div>
    </template>
  </el-popover>
</template>
<style scoped lang="scss">
.capture-image-list{
  display: flex;
  flex-shrink: 1;
  height: 80px;
  width: 80px;
  padding: 1px;
}

.capture-image-list img {
  object-fit: fill;
  width: 100%;
  height: 100%;
  border: 0;
}

.capture-image {
  display: flex;
  flex-shrink: 1;
  height: 165px;
  width: 170px;
  padding: 1px;
}

.capture-image img {
  object-fit: fill;
  width: 100%;
  height: 100%;
  border: 0;
}

.comparison-image {
  width: 180px;
  height: 175px;
}

.face-image {
  width: 80px;
  height: 70px;
  box-shadow: var(--el-box-shadow-lighter);
}

.left-top-image {
  width: 85px;
  height: 85px;
}


.page-vehicle-face-image {
  right: 1px;
  width: 100px;
  height: 140px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--el-border-color);
  overflow: hidden;
  flex-shrink: 0;

}

.page-vehicle-face-image img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.page-face-image {
  right: 1px;
  width: 96px;
  height: 125px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--el-border-color);
  overflow: hidden;
  flex-shrink: 0;
}

.page-face-image img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

/*element-ui page 默认颜色覆盖*/
:deep(.el-popover .el-popper) {
  background: unset;
  background: var(--default-main-color) !important;
}

.face-permission-menu {
  max-width: 120px;
  min-width: 80px;

  .menu-item {
    padding: 5px;
    line-height: 20px;
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    color: var(--default-main-color);
  }

  .menu-item:hover {
    background: var(--default-main-color);
    background-color: var(--default-main-color);
    color: white;
  }
}

</style>
<style>


</style>
