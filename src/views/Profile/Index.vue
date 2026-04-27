<template>
  <div class="profile-container flex gap-4">
    <ContentWrap class="user-sidebar w-1/3" :title="t('profile.user.title')">
      <ProfileUser ref="profileUserRef" />
    </ContentWrap>
    
    <ContentWrap class="user-main w-2/3">
      <div class="tabs-wrapper">
        <el-tabs v-model="activeName" class="vms-profile-tabs">
          <el-tab-pane :label="t('profile.info.basicInfo')" name="basicInfo">
            <div class="pane-content">
              <BasicInfo @success="handleBasicInfoSuccess" />
            </div>
          </el-tab-pane>
          <el-tab-pane :label="t('profile.info.resetPwd')" name="resetPwd">
            <div class="pane-content">
              <ResetPwd />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </ContentWrap>
  </div>
</template>

<script lang="ts" setup>
import { BasicInfo, ProfileUser, ResetPwd } from './components'

const { t } = useI18n()
defineOptions({ name: 'Profile' })
const activeName = ref('basicInfo')
const profileUserRef = ref()

// 处理基本信息更新成功
const handleBasicInfoSuccess = async () => {
  await profileUserRef.value?.refresh()
}
</script>

<style lang="scss" scoped>
.profile-container {
  padding: 0;
  height: 100%;
}

.user-sidebar, .user-main {
  height: fit-content;
}

.tabs-wrapper {
  padding: 8px;
}

.pane-content {
  padding: 24px 0;
}

:deep(.vms-profile-tabs) {
  .el-tabs__header {
    margin-bottom: 24px;
    border-bottom: 1px solid rgba(56, 189, 248, 0.1);
  }

  .el-tabs__nav-wrap::after {
    display: none;
  }

  .el-tabs__item {
    color: #94a3b8;
    font-size: 14px;
    height: 48px;
    line-height: 48px;
    padding: 0 24px !important;
    transition: all 0.3s;

    &:hover {
      color: #38bdf8;
    }

    &.is-active {
      color: #38bdf8;
      font-weight: 600;
    }
  }

  .el-tabs__active-bar {
    background-color: #38bdf8;
    height: 2px;
    box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
  }
}
</style>
