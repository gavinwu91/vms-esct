<template>
    <div class="stat-card">
      <div class="stat-icon" v-if="icon">
        <component :is="icon" class="icon" />
      </div>
      <div class="stat-content">
        <div class="stat-title">{{ title }}</div>
        <div class="stat-value">
          {{ value }}
          <span class="unit" v-if="unit">{{ unit }}</span>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    title: {
      type: String,
      required: true,
    },
    value: {
      type: [String, Number],
      required: true,
    },
    unit: {
      type: String,
      default: '',
    },
    icon: {
      type: [String, Object],
      default: null,
    },
  })
  </script>
  
  <style scoped>
  .stat-card {
    display: flex;
    align-items: center;
    background-color: #fff;
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: box-shadow 0.2s;
  }
  
  .stat-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  
  .stat-icon {
    margin-right: 16px;
  }
  
  .icon {
    font-size: 32px;
    color: #409EFF;
  }
  
  .stat-content {
    flex: 1;
  }
  
  .stat-title {
    font-size: 14px;
    color: #888;
  }
  
  .stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #333;
  }
  
  .unit {
    font-size: 14px;
    margin-left: 4px;
    color: #666;
  }
  </style>
  