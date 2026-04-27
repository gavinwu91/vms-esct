<template>
  <div class="profile-user-inner">
    <div class="avatar-section">
      <UserAvatar :img="userInfo?.avatar" />
      <div class="user-id-badge" v-if="userInfo?.username">
        {{ userInfo.username }}
      </div>
    </div>
    
    <div class="info-list">
      <div class="info-item">
        <div class="label">
          <Icon icon="ep:user" />
          <span>{{ t('profile.user.username') }}</span>
        </div>
        <div class="value">{{ userInfo?.username }}</div>
      </div>

      <div class="info-item">
        <div class="label">
          <Icon icon="ep:phone" />
          <span>{{ t('profile.user.mobile') }}</span>
        </div>
        <div class="value">{{ userInfo?.mobile }}</div>
      </div>

      <div class="info-item">
        <div class="label">
          <Icon icon="fontisto:email" />
          <span>{{ t('profile.user.email') }}</span>
        </div>
        <div class="value">{{ userInfo?.email }}</div>
      </div>

      <div class="info-item">
        <div class="label">
          <Icon icon="carbon:tree-view-alt" />
          <span>{{ t('profile.user.dept') }}</span>
        </div>
        <div class="value" v-if="userInfo?.dept">{{ userInfo.dept.name }}</div>
      </div>

      <div class="info-item">
        <div class="label">
          <Icon icon="ep:suitcase" />
          <span>{{ t('profile.user.posts') }}</span>
        </div>
        <div class="value" v-if="userInfo?.posts">
          {{ userInfo.posts.map((post) => post.name).join(', ') }}
        </div>
      </div>

      <div class="info-item">
        <div class="label">
          <Icon icon="icon-park-outline:peoples" />
          <span>{{ t('profile.user.roles') }}</span>
        </div>
        <div class="value" v-if="userInfo?.roles">
          {{ userInfo.roles.map((role) => role.name).join(', ') }}
        </div>
      </div>

      <div class="info-item border-none">
        <div class="label">
          <Icon icon="ep:calendar" />
          <span>{{ t('profile.user.createTime') }}</span>
        </div>
        <div class="value">{{ formatDate(userInfo.createTime) }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { formatDate } from '@/utils/formatTime'
import UserAvatar from './UserAvatar.vue'
import { getUserProfile, ProfileVO } from '@/api/system/user/profile'

defineOptions({ name: 'ProfileUser' })

const { t } = useI18n()
const userInfo = ref({} as ProfileVO)
const getUserInfo = async () => {
  const users = await getUserProfile()
  userInfo.value = users
}

defineExpose({
  refresh: getUserInfo
})

onMounted(async () => {
  await getUserInfo()
})
</script>

<style lang="scss" scoped>
.profile-user-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
  
  .user-id-badge {
    margin-top: 16px;
    padding: 4px 12px;
    background: rgba(56, 189, 248, 0.1);
    border: 1px solid rgba(56, 189, 248, 0.2);
    border-radius: 20px;
    color: #38bdf8;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 1px;
    font-family: 'Courier New', monospace;
  }
}

.info-list {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  
  &.border-none {
    border-bottom: none;
  }

  .label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #94a3b8;
    font-size: 13px;
    
    .el-icon, span {
      display: inline-block;
      vertical-align: middle;
    }
    
    span {
      opacity: 0.8;
    }
  }

  .value {
    color: #f1f5f9;
    font-size: 13px;
    font-weight: 500;
    text-align: right;
    max-width: 60%;
    word-break: break-all;
  }
}
</style>
