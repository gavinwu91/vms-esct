<template>
  <div class="svg-ribbon-bg">
    <div class="dynamic-bg"></div>
    <svg :width="width" :height="height" class="ribbon-svg">
      <defs>
        <linearGradient id="ribbonBlue" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" :stop-color="ribbonGradientColors.start" :stop-opacity="0.65"/>
          <stop offset="15%" :stop-color="ribbonGradientColors.mid1" :stop-opacity="0.85"/>
          <stop offset="35%" :stop-color="ribbonGradientColors.mid2" :stop-opacity="0.75"/>
          <stop offset="55%" :stop-color="ribbonGradientColors.end" :stop-opacity="0.52"/>
          <stop offset="75%" :stop-color="ribbonGradientColors.mid1" :stop-opacity="0.85"/>
          <stop offset="90%" :stop-color="ribbonGradientColors.mid2" :stop-opacity="0.75"/>
          <stop offset="100%" :stop-color="ribbonGradientColors.start" :stop-opacity="0.65"/>
        </linearGradient>
        <linearGradient id="ribbonBlueWave" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop :offset="(0 + waveGradientOffset) + '%'" :stop-color="ribbonGradientColors.start" :stop-opacity="0.55"/>
          <stop :offset="(20 + waveGradientOffset) + '%'" :stop-color="ribbonGradientColors.mid1" :stop-opacity="0.65"/>
          <stop :offset="(40 + waveGradientOffset) + '%'" :stop-color="ribbonGradientColors.mid2" :stop-opacity="0.60"/>
          <stop :offset="(60 + waveGradientOffset) + '%'" :stop-color="ribbonGradientColors.end" :stop-opacity="0.50"/>
          <stop :offset="(80 + waveGradientOffset) + '%'" :stop-color="ribbonGradientColors.mid1" :stop-opacity="0.65"/>
          <stop :offset="(100 + waveGradientOffset) + '%'" :stop-color="ribbonGradientColors.start" :stop-opacity="0.55"/>
        </linearGradient>
        <!-- 星光线条渐变 -->
        <linearGradient id="starLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
          <stop offset="30%" stop-color="#4fc3f7" stop-opacity="0.7"/>
          <stop offset="70%" stop-color="#1976d2" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#0d47a1" stop-opacity="0.2"/>
        </linearGradient>
        <!-- 星光点渐变 - 多种随机色彩 -->
        <linearGradient id="starLightGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#9c27b0" stop-opacity="1"/>
          <stop offset="25%" stop-color="#673ab7" stop-opacity="0.9"/>
          <stop offset="50%" stop-color="#2196f3" stop-opacity="0.8"/>
          <stop offset="75%" stop-color="#673ab7" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#9c27b0" stop-opacity="1"/>
        </linearGradient>
        <linearGradient id="starLightGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#e91e63" stop-opacity="1"/>
          <stop offset="25%" stop-color="#f06292" stop-opacity="0.9"/>
          <stop offset="50%" stop-color="#ff4081" stop-opacity="0.8"/>
          <stop offset="75%" stop-color="#f06292" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#e91e63" stop-opacity="1"/>
        </linearGradient>
        <linearGradient id="starLightGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#00bcd4" stop-opacity="1"/>
          <stop offset="25%" stop-color="#4dd0e1" stop-opacity="0.9"/>
          <stop offset="50%" stop-color="#26c6da" stop-opacity="0.8"/>
          <stop offset="75%" stop-color="#4dd0e1" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#00bcd4" stop-opacity="1"/>
        </linearGradient>
        <linearGradient id="starLightGradient4" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ff9800" stop-opacity="1"/>
          <stop offset="25%" stop-color="#ffb74d" stop-opacity="0.9"/>
          <stop offset="50%" stop-color="#ffa726" stop-opacity="0.8"/>
          <stop offset="75%" stop-color="#ffb74d" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#ff9800" stop-opacity="1"/>
        </linearGradient>
        <linearGradient id="starLightGradient5" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#4caf50" stop-opacity="1"/>
          <stop offset="25%" stop-color="#66bb6a" stop-opacity="0.9"/>
          <stop offset="50%" stop-color="#81c784" stop-opacity="0.8"/>
          <stop offset="75%" stop-color="#66bb6a" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#4caf50" stop-opacity="1"/>
        </linearGradient>
      </defs>
      
              <!-- 星光点效果 -->
        <g v-for="starLine in starLines" :key="starLine.id">
          <!-- 多个随机渐变炫酷小光点划过效果 -->
          <!-- 主光点 - 随机渐变核心 -->
          <circle
            :cx="starLine.x1 + (starLine.x2 - starLine.x1) * starLine.lightProgress"
            :cy="starLine.y1 + (starLine.y2 - starLine.y1) * starLine.lightProgress"
            r="4"
            :fill="`url(#starLightGradient${starLine.colorIndex1})`"
            :opacity="starLine.lightOpacity"
            :style="{ filter: 'blur(0.5px)' }"
          />
          <!-- 主光点外圈光晕 -->
          <circle
            :cx="starLine.x1 + (starLine.x2 - starLine.x1) * starLine.lightProgress"
            :cy="starLine.y1 + (starLine.y2 - starLine.y1) * starLine.lightProgress"
            r="8"
            :fill="`url(#starLightGradient${starLine.colorIndex1})`"
            :opacity="starLine.lightOpacity * 0.4"
            :style="{ filter: 'blur(2px)' }"
          />
          <!-- 第二个光点 - 随机渐变 -->
          <circle
            :cx="starLine.x1 + (starLine.x2 - starLine.x1) * starLine.lightProgress2"
            :cy="starLine.y1 + (starLine.y2 - starLine.y1) * starLine.lightProgress2"
            r="3"
            :fill="`url(#starLightGradient${starLine.colorIndex2})`"
            :opacity="starLine.lightOpacity2"
            :style="{ filter: 'blur(0.8px)' }"
          />
          <!-- 第二个光点外圈 -->
          <circle
            :cx="starLine.x1 + (starLine.x2 - starLine.x1) * starLine.lightProgress2"
            :cy="starLine.y1 + (starLine.y2 - starLine.y1) * starLine.lightProgress2"
            r="6"
            :fill="`url(#starLightGradient${starLine.colorIndex2})`"
            :opacity="starLine.lightOpacity2 * 0.5"
            :style="{ filter: 'blur(1.5px)' }"
          />
          <!-- 第三个光点 - 随机渐变 -->
          <circle
            :cx="starLine.x1 + (starLine.x2 - starLine.x1) * starLine.lightProgress3"
            :cy="starLine.y1 + (starLine.y2 - starLine.y1) * starLine.lightProgress3"
            r="2.5"
            :fill="`url(#starLightGradient${starLine.colorIndex3})`"
            :opacity="starLine.lightOpacity3"
            :style="{ filter: 'blur(0.5px)' }"
          />
          <!-- 第三个光点外圈 -->
          <circle
            :cx="starLine.x1 + (starLine.x2 - starLine.x1) * starLine.lightProgress3"
            :cy="starLine.y1 + (starLine.y2 - starLine.y1) * starLine.lightProgress3"
            r="5"
            :fill="`url(#starLightGradient${starLine.colorIndex3})`"
            :opacity="starLine.lightOpacity3 * 0.45"
            :style="{ filter: 'blur(1.2px)' }"
          />
          <!-- 第四个光点 - 随机渐变 -->
          <circle
            :cx="starLine.x1 + (starLine.x2 - starLine.x1) * starLine.lightProgress4"
            :cy="starLine.y1 + (starLine.y2 - starLine.y1) * starLine.lightProgress4"
            r="3.5"
            :fill="`url(#starLightGradient${starLine.colorIndex4})`"
            :opacity="starLine.lightOpacity4"
            :style="{ filter: 'blur(0.8px)' }"
          />
          <!-- 第四个光点外圈 -->
          <circle
            :cx="starLine.x1 + (starLine.x2 - starLine.x1) * starLine.lightProgress4"
            :cy="starLine.y1 + (starLine.y2 - starLine.y1) * starLine.lightProgress4"
            r="7"
            :fill="`url(#starLightGradient${starLine.colorIndex4})`"
            :opacity="starLine.lightOpacity4 * 0.4"
            :style="{ filter: 'blur(1.8px)' }"
          />
          <!-- 第五个光点 - 随机渐变 -->
          <circle
            :cx="starLine.x1 + (starLine.x2 - starLine.x1) * starLine.lightProgress5"
            :cy="starLine.y1 + (starLine.y2 - starLine.y1) * starLine.lightProgress5"
            r="2"
            :fill="`url(#starLightGradient${starLine.colorIndex5})`"
            :opacity="starLine.lightOpacity5"
            :style="{ filter: 'blur(0.3px)' }"
          />
          <!-- 第五个光点外圈 -->
          <circle
            :cx="starLine.x1 + (starLine.x2 - starLine.x1) * starLine.lightProgress5"
            :cy="starLine.y1 + (starLine.y2 - starLine.y1) * starLine.lightProgress5"
            r="4"
            :fill="`url(#starLightGradient${starLine.colorIndex5})`"
            :opacity="starLine.lightOpacity5 * 0.6"
            :style="{ filter: 'blur(1px)' }"
          />
          <circle
            :cx="starLine.x1"
            :cy="starLine.y1"
            r="2"
            fill="#ffffff"
            opacity="0.8"
            :style="{ filter: 'blur(0.3px)' }"
          />
        </g>
      
      <g v-for="(ribbon, i) in ribbons" :key="i">
        <!-- 折叠效果区段 -->
        <g v-for="fold in getRibbonFolds(ribbon, i)" :key="fold.pointsStr">
          <polygon
            :points="fold.pointsStr"
            :fill="fold.isHighlight ? 'rgba(10,30,80,0.25)' : 'rgba(10,30,80,0.32)'"
            :opacity="fold.opacity"
            :style="{ filter: fold.isHighlight ? 'blur(1.2px)' : 'blur(1px)' }"
          />
          <polygon
            v-if="fold.isOverlay"
            :points="fold.pointsStr"
            :fill="ribbonGradientColors.end + '55'"
            :opacity="0.55"
            :style="{ filter: 'blur(1.5px)' }"
          />
        </g>
        <!-- 主体丝带 -->
        <polygon
          :points="ribbon.pointsStr"
          fill="url(#ribbonBlueWave)"
          :opacity="Math.max(0.85, ribbon.opacity)"
          :style="{ filter: 'blur(0.2px)' }"
        />
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, onBeforeUnmount, computed } from 'vue'

defineOptions({ name: 'SvgRibbonBg' })

// 性能优化：响应式窗口尺寸
const width = ref(window.innerWidth)
const height = ref(window.innerHeight)

// 性能优化：页面可见性检测
let isPageVisible = ref(true)
let animId = null
let resizeTimeout = null



// 丝带渐变动画时间
const ribbonColorTime = ref(0)

// 动态丝带渐变颜色
const ribbonGradientColors = ref({
  start: '#1a4fa3',
  mid1: '#2580e6',
  mid2: '#3faaff',
  end: '#15305c'
})

// 计算波浪渐变偏移
const waveGradientOffset = computed(() => {
  return (Math.sin(ribbonColorTime.value * 0.3) + 1) * 50 // 0-100%的偏移
})

// 丝带配置
const baseList = [0.12, 0.38, 0.25, 0.75, 0.18, 0.62];
const vh = height.value / 100;
const ribbons = ref([
  { widthL: 80, widthR: 20, opacity: 0.58, phase: 11, base: baseList[0], spread: 0.08, speed: 0.0058, t: 0, driftSpeed: 0.21, driftAmp: 0.13, pointsStr: '', startOffset: {x: -0.25, y: -0.20}, endOffset: {x: 0.18, y: 0.12}, offsetSeed: 6.6, widthSeed: 7.1, moveDirection: 1 },
  { widthL: 60, widthR: 16, opacity: 0.52, phase: 7, base: baseList[1], spread: 0.09, speed: 0.0062, t: 0, driftSpeed: 0.19, driftAmp: 0.15, pointsStr: '', startOffset: {x: 0.20, y: -0.10}, endOffset: {x: -0.15, y: 0.18}, offsetSeed: 2.3, widthSeed: 3.2, moveDirection: -1 },
  { widthL: 25, widthR: 8, opacity: 0.42, phase: 5, base: baseList[2], spread: 0.06, speed: 0.0078, t: 0, driftSpeed: 0.35, driftAmp: 0.08, pointsStr: '', startOffset: {x: -0.12, y: -0.08}, endOffset: {x: 0.10, y: 0.06}, offsetSeed: 3.4, widthSeed: 4.7, moveDirection: 1 },
  { widthL: 20, widthR: 6, opacity: 0.38, phase: 9, base: baseList[3], spread: 0.05, speed: 0.0105, t: 0, driftSpeed: 0.38, driftAmp: 0.07, pointsStr: '', startOffset: {x: 0.08, y: -0.06}, endOffset: {x: -0.12, y: 0.10}, offsetSeed: 5.2, widthSeed: 6.8, moveDirection: -1 },
  { widthL: 35, widthR: 10, opacity: 0.45, phase: 13, base: baseList[4], spread: 0.07, speed: 0.0068, t: 0, driftSpeed: 0.28, driftAmp: 0.12, pointsStr: '', startOffset: {x: -0.15, y: 0.08}, endOffset: {x: 0.14, y: -0.09}, offsetSeed: 4.8, widthSeed: 5.9, moveDirection: 1 },
  { widthL: 30, widthR: 9, opacity: 0.41, phase: 15, base: baseList[5], spread: 0.06, speed: 0.0088, t: 0, driftSpeed: 0.32, driftAmp: 0.09, pointsStr: '', startOffset: {x: 0.12, y: 0.14}, endOffset: {x: -0.18, y: -0.11}, offsetSeed: 7.3, widthSeed: 8.4, moveDirection: -1 }
])

// 星光线条配置
const starLines = ref([])
const starLineId = ref(0)

// 生成星光线条
function createStarLine() {
  const id = starLineId.value++
  const offsetX = (Math.random() - 0.5) * 100 // 水平偏移±50px
  const offsetY = (Math.random() - 0.5) * 100 // 垂直偏移±50px
  
  const startX = -50 + offsetX
  const startY = -50 + offsetY
  const endX = width.value + 50 + offsetX
  const endY = height.value + 50 + offsetY
  
  return {
    id,
    x1: startX,
    y1: startY,
    x2: endX,
    y2: endY,
    opacity: 0.6 + Math.random() * 0.4,
    duration: 3000 + Math.random() * 2000, // 3-5秒持续时间
    startTime: Date.now(),
    lightProgress: 0, // 光点进度
    lightOpacity: 0, // 光点透明度
    lightProgress2: 0, // 第二个光点进度
    lightOpacity2: 0, // 第二个光点透明度
    lightProgress3: 0, // 第三个光点进度
    lightOpacity3: 0, // 第三个光点透明度
    lightProgress4: 0, // 第四个光点进度
    lightOpacity4: 0, // 第四个光点透明度
    lightProgress5: 0, // 第五个光点进度
    lightOpacity5: 0, // 第五个光点透明度
    colorIndex1: Math.floor(Math.random() * 5) + 1, // 随机颜色索引1
    colorIndex2: Math.floor(Math.random() * 5) + 1, // 随机颜色索引2
    colorIndex3: Math.floor(Math.random() * 5) + 1, // 随机颜色索引3
    colorIndex4: Math.floor(Math.random() * 5) + 1, // 随机颜色索引4
    colorIndex5: Math.floor(Math.random() * 5) + 1 // 随机颜色索引5
  }
}

// 性能优化：防抖窗口大小调整
function handleResize() {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
  resizeTimeout = setTimeout(() => {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }, 100)
}

// 性能优化：页面可见性变化处理
function handleVisibilityChange() {
  isPageVisible.value = !document.hidden
  if (isPageVisible.value) {
    // 页面变为可见时恢复动画
    if (!animId) {
      animate()
    }
  } else {
    // 页面不可见时暂停动画
    if (animId) {
      cancelAnimationFrame(animId)
      animId = null
    }
  }
}

// 性能优化：清理动画
function stopAnimation() {
  if (animId) {
    cancelAnimationFrame(animId)
    animId = null
  }
}

function getNormal(p0, p1) {
  const dx = p1[0] - p0[0]
  const dy = p1[1] - p0[1]
  const len = Math.sqrt(dx*dx + dy*dy) || 1
  return [-dy/len, dx/len]
}

function getDynamicOffset(base, t, seed, amp = 0.03) {
  return base + Math.sin(t * 0.18 + seed) * amp + Math.cos(t * 0.13 + seed * 1.7) * amp * 0.7
}

function getDynamicWidth(base, t, seed, amp = 0.08) {
  // 增强宽度动态变化，实现从细到宽的明显效果
  const baseVariation = Math.sin(t * 0.22 + seed) * amp + Math.cos(t * 0.13 + seed * 1.3) * amp * 0.6
  
  // 添加大幅度的宽度变化周期，模拟丝带从细到宽的飘动效果
  const wideCycle = Math.sin(t * 0.15 + seed * 2.1) * 0.18  // 进一步减少大幅度的宽度变化
  const narrowCycle = Math.cos(t * 0.18 + seed * 1.7) * 0.15 // 进一步减少细窄周期
  
  // 添加更平滑的宽度变化
  const smoothCycle = Math.sin(t * 0.12 + seed * 1.5) * 0.1
  
  // 为细丝带增加更明显的宽度变化
  const isThinRibbon = base <= 30;
  const thinAmp = isThinRibbon ? 0.15 : 0.08; // 细丝带振幅更大
  const thinWideCycle = isThinRibbon ? 0.25 : 0.18; // 细丝带宽度变化更明显
  const thinNarrowCycle = isThinRibbon ? 0.22 : 0.15; // 细丝带窄周期更明显
  
  // 组合多种变化，创造更自然的从细到宽效果
  const totalVariation = baseVariation + wideCycle + narrowCycle + smoothCycle + 
    (isThinRibbon ? (Math.sin(t * 0.25 + seed * 2.5) * thinAmp + Math.cos(t * 0.18 + seed * 1.8) * thinAmp * 0.8) : 0)
  
  // 确保宽度不会小于最小值，细丝带允许更大的变化范围
  const minWidth = isThinRibbon ? base * 0.3 : base * 0.5
  const maxWidth = isThinRibbon ? base * 2.2 : base * 1.6
  
  return Math.max(minWidth, Math.min(maxWidth, base * (1 + totalVariation)))
}

// 颜色插值函数
function interpolateColor(color1, color2, factor) {
  const r1 = parseInt(color1.slice(1, 3), 16)
  const g1 = parseInt(color1.slice(3, 5), 16)
  const b1 = parseInt(color1.slice(5, 7), 16)
  const r2 = parseInt(color2.slice(1, 3), 16)
  const g2 = parseInt(color2.slice(3, 5), 16)
  const b2 = parseInt(color2.slice(5, 7), 16)
  
  const r = Math.round(r1 + (r2 - r1) * factor)
  const g = Math.round(g1 + (g2 - g1) * factor)
  const b = Math.round(b1 + (b2 - b1) * factor)
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// 更新丝带渐变颜色
function updateRibbonColors(t) {
  // 定义颜色变化周期
  const cycle = Math.sin(t * 0.1) // 10秒一个周期
  const factor = (cycle + 1) / 2 // 将-1到1映射到0到1
  
  // 定义起始颜色（稍亮的蓝色系）
  const startColors = {
    start: '#2a5a8a',
    mid1: '#3a7ac8',
    mid2: '#4a9aff',
    end: '#5ab3ff'
  }
  
  // 定义目标颜色（更亮的蓝色系）
  const endColors = {
    start: '#3a7ac8',
    mid1: '#4a9aff',
    mid2: '#5ab3ff',
    end: '#6ac7ff'
  }
  
  // 插值计算当前颜色
  ribbonGradientColors.value = {
    start: interpolateColor(startColors.start, endColors.start, factor),
    mid1: interpolateColor(startColors.mid1, endColors.mid1, factor),
    mid2: interpolateColor(startColors.mid2, endColors.mid2, factor),
    end: interpolateColor(startColors.end, endColors.end, factor)
  }
}

function makeRibbonPolygon(t, phase, amp, base, spread, driftSpeed, driftAmp, widthL, widthR, startOffset, endOffset, offsetSeed, widthSeed, moveDirection = 1) {
  const points = []
  const yBase = base + Math.sin(t + phase) * spread + Math.sin(t * driftSpeed + phase * 1.5) * driftAmp
  // 动态随机偏移
  let sOffset = startOffset, eOffset = endOffset
  if (offsetSeed !== undefined) {
    sOffset = {
      x: getDynamicOffset(startOffset.x, t, offsetSeed, 0.03),
      y: getDynamicOffset(startOffset.y, t, offsetSeed + 1, 0.03)
    }
    eOffset = {
      x: getDynamicOffset(endOffset.x, t, offsetSeed + 2, 0.03),
      y: getDynamicOffset(endOffset.y, t, offsetSeed + 3, 0.03)
    }
  }
      // 动态宽度
    let dynWidthL = widthL, dynWidthR = widthR
    if (widthSeed !== undefined) {
      // 增强中间宽度动态变化，实现明显的从细到宽效果
      const midWide = 1 + 0.4 * Math.max(0, Math.sin(t*0.7 + phase) * Math.cos(t*0.23 + (offsetSeed||0)));
      
      // 添加更频繁的宽度变化周期，减少毛边
      const fastCycle = Math.sin(t * 0.35 + widthSeed) * 0.1  // 进一步减少快速变化
      const slowCycle = Math.cos(t * 0.12 + widthSeed * 1.3) * 0.18  // 进一步减少慢速大幅变化
      
      // 添加平滑过渡
      const smoothTransition = Math.sin(t * 0.08 + widthSeed * 0.8) * 0.05
      
      // 为细丝带增加更明显的宽度变化
      const isThinRibbon = widthL <= 30; // 判断是否为细丝带
      const thinWideFactor = isThinRibbon ? 1.8 : 1.0; // 细丝带宽度变化更明显
      
      dynWidthL = getDynamicWidth(widthL, t, widthSeed, 0.18) * (0.7 + 0.4 * midWide + fastCycle + slowCycle + smoothTransition) * thinWideFactor;
      dynWidthR = getDynamicWidth(widthR, t, widthSeed + 1.5, 0.18) * (0.7 + 0.4 * midWide + fastCycle + slowCycle + smoothTransition) * thinWideFactor;
    }
      // 每条丝带的中间偏移幅度、频率、相位都更随机，减少弯曲幅度
    const midAmp = 80 + (offsetSeed || 0) * 12 + Math.sin(t * 0.13 + (offsetSeed || 0) * 2.3) * 20
    const midFreq = 1.2 + (offsetSeed || 0) * 0.13 + Math.cos(t * 0.19 + (offsetSeed || 0) * 1.7) * 0.18
    const midPhase = (offsetSeed || 0) * 2.7 + Math.sin(t * 0.11 + (offsetSeed || 0) * 1.9) * 1.5
  for (let i = 0; i <= 60; i++) {
    let ratio = (i / 60) * 1.8 - 0.4  // 从-0.4到1.4，让丝带从更远的屏幕外开始，完全隐藏头部
    let x = ratio * width.value
    let y = ratio * height.value + Math.sin(ratio * 2 * Math.PI + t + phase) * amp
    if (sOffset && eOffset) {
      x += (sOffset.x * (1 - ratio) + eOffset.x * ratio) * width.value
      y += (sOffset.y * (1 - ratio) + eOffset.y * ratio) * height.value
    }
    // 中间点偏移更大且每条丝带完全不同，使用更平滑的曲线
    const midFactor = Math.sin(Math.PI * ratio)
    const smoothOffset = midFactor * midAmp * Math.sin(t * midFreq + midPhase + phase + ratio * 2)
    // 添加额外的平滑处理，根据移动方向调整，减少弯曲幅度
    const extraSmooth = Math.sin(ratio * Math.PI * 3 + t * 0.3 + phase) * 8 * moveDirection
    y += smoothOffset + extraSmooth
    points.push([x, yBase * height.value + (y - yBase * height.value)])
  }
  const left = []
  const right = []
  for (let i = 0; i < points.length; i++) {
    // 增强中间宽度动态变化，实现明显的从细到宽效果
    let w = dynWidthL + (dynWidthR - dynWidthL) * (i / (points.length-1))
    
    // 添加基于位置的宽度变化，模拟丝带飘动时的自然变形
    const positionRatio = i / (points.length - 1)
    const positionCycle = Math.sin(positionRatio * Math.PI * 2 + t * 0.4 + phase) * 0.15
    
    // 让中间宽度有更明显的从细到宽效果，使用更平滑的曲线
    const centerRatio = Math.abs(i - points.length/2) / (points.length/2)
    const centerWide = 1 + 0.5 * Math.exp(-centerRatio*centerRatio*2.5) * Math.max(0, Math.sin(t*0.7 + phase))
    
    // 添加额外的平滑宽度变化
    const smoothWidth = Math.sin(positionRatio * Math.PI * 3 + t * 0.2 + phase) * 0.1
    
    // 组合所有宽度变化因素，使用更平滑的变化
    w *= (1 + positionCycle + centerWide + smoothWidth + 0.15 * Math.sin(t*0.25 + i*0.06))
    
    const p = points[i]
    const n = i < points.length-1 ? getNormal(p, points[i+1]) : getNormal(points[i-1], p)
    left.push([p[0] + n[0]*w/2, p[1] + n[1]*w/2])
    right.push([p[0] - n[0]*w/2, p[1] - n[1]*w/2])
  }
  const all = left.concat(right.reverse())
  return all.map(pt => pt.join(",")).join(" ")
}

function animate() {
  // 性能优化：只在页面可见时执行动画
  if (!isPageVisible.value) {
    return
  }
  
  // 更新丝带颜色
  ribbonColorTime.value += 0.016 // 约60fps
  updateRibbonColors(ribbonColorTime.value)
  
  // 更新星光线条
  starLines.value.forEach((starLine, index) => {
    const elapsed = Date.now() - starLine.startTime;
    if (elapsed > starLine.duration) {
      starLines.value.splice(index, 1);
    } else {
      starLine.opacity = 0.6 + (1 - elapsed / starLine.duration) * 0.4;
      
      // 更新多个光点动画
      const progress = elapsed / starLine.duration;
      
      // 第一个光点（白色，主光点）
      starLine.lightProgress = progress;
      if (progress < 0.3) {
        starLine.lightOpacity = progress / 0.3;
      } else if (progress > 0.7) {
        starLine.lightOpacity = (1 - progress) / 0.3;
      } else {
        starLine.lightOpacity = 1;
      }
      
      // 第二个光点（蓝色，稍后出现）
      starLine.lightProgress2 = Math.max(0, progress - 0.15);
      if (starLine.lightProgress2 < 0.25) {
        starLine.lightOpacity2 = starLine.lightProgress2 / 0.25;
      } else if (starLine.lightProgress2 > 0.75) {
        starLine.lightOpacity2 = (1 - starLine.lightProgress2) / 0.25;
      } else {
        starLine.lightOpacity2 = 1;
      }
      
      // 第三个光点（绿色，更后出现）
      starLine.lightProgress3 = Math.max(0, progress - 0.3);
      if (starLine.lightProgress3 < 0.2) {
        starLine.lightOpacity3 = starLine.lightProgress3 / 0.2;
      } else if (starLine.lightProgress3 > 0.8) {
        starLine.lightOpacity3 = (1 - starLine.lightProgress3) / 0.2;
      } else {
        starLine.lightOpacity3 = 1;
      }
      
      // 第四个光点（紫色，更后出现）
      starLine.lightProgress4 = Math.max(0, progress - 0.45);
      if (starLine.lightProgress4 < 0.15) {
        starLine.lightOpacity4 = starLine.lightProgress4 / 0.15;
      } else if (starLine.lightProgress4 > 0.85) {
        starLine.lightOpacity4 = (1 - starLine.lightProgress4) / 0.15;
      } else {
        starLine.lightOpacity4 = 1;
      }
      
      // 第五个光点（金色，最后出现）
      starLine.lightProgress5 = Math.max(0, progress - 0.6);
      if (starLine.lightProgress5 < 0.1) {
        starLine.lightOpacity5 = starLine.lightProgress5 / 0.1;
      } else if (starLine.lightProgress5 > 0.9) {
        starLine.lightOpacity5 = (1 - starLine.lightProgress5) / 0.1;
      } else {
        starLine.lightOpacity5 = 1;
      }
    }
  })
  
  // 偶尔生成新星光线条
  if (Math.random() < 0.005 && starLines.value.length < 1) { // 0.5%概率生成，最多1个
    starLines.value.push(createStarLine())
  }
  
  ribbons.value.forEach((r) => {
    r.t += r.speed
    r.pointsStr = makeRibbonPolygon(r.t, r.phase, 60, r.base, r.spread, r.driftSpeed, r.driftAmp, r.widthL, r.widthR, r.startOffset, r.endOffset, r.offsetSeed, r.widthSeed, r.moveDirection)
  })
  animId = requestAnimationFrame(animate)
}

onMounted(() => {
  // 性能优化：添加事件监听器
  window.addEventListener('resize', handleResize)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // 启动动画
  animate()
})

onBeforeUnmount(() => {
  // 性能优化：清理事件监听器
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  
  // 清理定时器
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
    resizeTimeout = null
  }
})

onUnmounted(() => {
  // 性能优化：确保动画完全停止
  stopAnimation()
  
  // 清理数据
  ribbons.value = []
  starLines.value = []
})

const ribbonStrokeColor = computed(() => {
  // 取渐变色的end色调，稍微亮一点
  const base = ribbonGradientColors.value.end || '#1976d2';
  // 亮化处理
  function lighten(color, percent) {
    const r = Math.min(255, parseInt(color.slice(1,3),16) + percent);
    const g = Math.min(255, parseInt(color.slice(3,5),16) + percent);
    const b = Math.min(255, parseInt(color.slice(5,7),16) + percent);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }
  return lighten(base, 40); // 比原色亮一点
});

function getRibbonFolds(ribbon, idx) {
  // 生成1~2个折叠区段，位置和宽度随时间和idx变化
  const folds = [];
  const t = ribbon.t;
  const count = 1 + (idx % 2); // 1或2个折叠
  for (let f = 0; f < count; f++) {
    // 折叠中心点在0.2~0.8之间波动
    const center = 0.2 + 0.6 * ((Math.sin(t*0.5 + idx + f*2) + 1) / 2) * (0.7 + 0.3*Math.sin(t*0.7+f));
    const width = 0.08 + 0.06 * Math.abs(Math.sin(t*0.8 + idx + f));
    const isHighlight = ((idx+f)%2) === 0;
    const opacity = isHighlight ? 0.7 : 0.5;
    // 取主polygon的点，截取一段
    const pts = ribbon.pointsStr.split(' ').map(s => s.split(',').map(Number));
    const n = pts.length;
    const startIdx = Math.max(0, Math.floor((center-width/2)*n));
    const endIdx = Math.min(n-1, Math.ceil((center+width/2)*n));
    if (endIdx-startIdx > 2) {
      let foldPts = pts.slice(startIdx, endIdx+1);
      // 对折叠区段做轻微扰动/拉伸，模拟重合
      foldPts = foldPts.map((pt, i) => {
        const ratio = i/(foldPts.length-1);
        const offset = (Math.sin(t*1.2 + idx + f*2 + ratio*3) * 8 + Math.cos(t*0.9 + idx - ratio*2) * 4) * (isHighlight ? 1 : -1);
        return [pt[0] + offset, pt[1] + offset*0.2];
      });
      const foldStr = foldPts.map(pt => pt.join(",")).join(" ");
      // 主色重合层
      folds.push({
        pointsStr: foldStr,
        isHighlight,
        opacity,
        isOverlay: true
      });
    }
  }
  return folds;
}
</script>

<style scoped>
.svg-ribbon-bg {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0; /* 设置为0，确保背景可见但不会遮挡其他内容 */
  pointer-events: none;
  /* 还原为纯蓝色静态渐变背景 */
  background: linear-gradient(to bottom, #0a1626 0%, #1a4fa3 100%);
}

.ribbon-svg {
  position: absolute;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: block;
  z-index: 1;
}

/* 动态蓝紫渐变背景 */
.dynamic-bg {
  position: absolute;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    #101a2c 0%,
    #15305c 30%,
    #1a4fa3 65%,
    #2580e6 85%,
    #3faaff 100%
  );
  background-size: 100% 100%;
  animation: bgGradientMove 16s ease-in-out infinite;
}
.dynamic-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(10,20,40,0.25);
  pointer-events: none;
  z-index: 1;
}

@keyframes bgGradientMove {
  0%, 100% {
    filter: brightness(1) contrast(1);
  }
  25% {
    filter: brightness(1.08) contrast(1.08);
  }
  50% {
    filter: brightness(1.12) contrast(1.12);
  }
  75% {
    filter: brightness(1.05) contrast(1.05);
  }
}
</style> 
