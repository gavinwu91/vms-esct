<template>
  <div class="playback-container">
    <!-- 视频播放器区域 -->
    <div
      class="video-wrapper"
      @mouseenter="showControls = true"
      @mouseleave="showControls = false"
    >
      <video
        ref="video"
        class="video-player"
        @ended="playNextSegment"
        @timeupdate="updateCurrentTime"
        playsinline
      ></video>

      <!-- 中间的播放/暂停按钮 -->
      <div
        v-if="showControls"
        class="center-control"
        @click="togglePlay"
      >
        <span v-if="!isPlaying">▶</span>
        <span v-else>⏸</span>
      </div>
    </div>

    <!-- 日期 + 时间刻度 -->
    <div
      class="timeline-wrapper"
      ref="timelineWrapper"
      @mousedown="onTimelineMouseDown"
    >
      <!-- 日期段 -->
      <div class="date-row" :style="{ width: timelineWidth + 'px' }">
        <div
          v-for="(seg, i) in dateSegments"
          :key="i"
          class="date-segment"
          :style="{ width: seg.width + 'px' }"
        >
          {{ seg.label }}
        </div>
      </div>

      <!-- 时间刻度 -->
      <div class="timeline" :style="{ width: timelineWidth + 'px' }">
        <div
          v-for="(tick, i) in ticks"
          :key="i"
          class="tick"
          :class="{
            'hour-tick': tick.isHour,
            'has-data': tick.hasData
          }"
          :style="{ left: tick.position + 'px', height: tick.isHour ? '16px' : '8px' }"
          @click.stop="jumpToTick(tick)"
        >
          <span v-if="tick.isHour" class="tick-label">{{ tick.label }}</span>
        </div>

        <!-- 播放位置线 -->
        <div
          class="playhead"
          :style="{ left: playheadX + 'px' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Hls from "hls.js";
import { ref, computed, onMounted } from "vue";

// 模拟查询时间范围
const queryStart = new Date("2025-08-09T00:00:00+08:00")
const queryEnd = new Date("2025-08-10T23:59:59+08:00")


// 播放列表
const playlist = ref([
  { name: "14-05.mp4", src: "/videos/test.mp4", startOffset: 3600*30 + 150*1, duration: 150 },
  { name: "14-05.mp4", src: "/videos/test.mp4", startOffset: 3600*30 + 150*2, duration: 150 },
  { name: "14-05.mp4", src: "/videos/test.mp4", startOffset: 3600*30 + 150*3, duration: 150 },
  { name: "14-05.mp4", src: "/videos/test.mp4", startOffset: 3600*30 + 150*4, duration: 150 },
  { name: "14-05.mp4", src: "/videos/test.mp4", startOffset: 3600*30 + 150*5, duration: 150 },
  { name: "14-05.mp4", src: "/videos/test.mp4", startOffset: 3600*30 + 150*6, duration: 150 },
  { name: "14-05.mp4", src: "/videos/test.mp4", startOffset: 3600*30 + 150*7, duration: 150 },
  { name: "14-10.mp4", src: "/videos/test.mp4", startOffset: 3600*3+1000, duration: 3000 }
]);

// 播放器相关
const video = ref(null);
const currentSegmentIndex = ref(0);
const globalCurrentTime = ref(0);
const isPlaying = ref(false);
const showControls = ref(false);
let hls;

function loadSegment(index, autoPlay = true) {
  const segment = playlist.value[index];
  if (!segment) return;

  const isM3U8 = segment.src.endsWith(".m3u8");
  if (hls) {
    hls.destroy();
    hls = null;
  }

  if (isM3U8 && Hls.isSupported()) {
    hls = new Hls();
    hls.loadSource(segment.src);
    hls.attachMedia(video.value);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.value.currentTime = 0;
      if (autoPlay) playVideo();
    });
  } else {
    video.value.src = segment.src;
    video.value.currentTime = 0;
    if (autoPlay) playVideo();
  }
}

function playVideo() {
  video.value.play().then(() => {
    isPlaying.value = true;
  }).catch(() => {});
}

function pauseVideo() {
  video.value.pause();
  isPlaying.value = false;
}

function togglePlay() {
  if (isPlaying.value) {
    pauseVideo();
  } else {
    playVideo();
  }
}

function playNextSegment() {
  if (currentSegmentIndex.value < playlist.value.length - 1) {
    currentSegmentIndex.value++;
    loadSegment(currentSegmentIndex.value);
  }
}

function updateCurrentTime() {
  const segment = playlist.value[currentSegmentIndex.value];
  if (segment) {
    globalCurrentTime.value = segment.startOffset + video.value.currentTime;
  }
}

// 点击刻度跳转并自动播放
function jumpToTick(tick) {
  seekGlobal(tick.position / pxPerSecond.value);
  playVideo();
}

function seekGlobal(seconds) {
  let targetIndex = playlist.value.findIndex(
    seg => seconds >= seg.startOffset && seconds < seg.startOffset + seg.duration
  );
  if (targetIndex === -1) return;
  currentSegmentIndex.value = targetIndex;
  loadSegment(targetIndex);
  video.value.currentTime = seconds - playlist.value[targetIndex].startOffset;
}

// 时间轴计算
const pxPerSecond = computed(() => {
  return 1000 / 86400; // 一天1000px
});
const timelineWidth = computed(() => {
  const totalSeconds = (queryEnd - queryStart) / 1000;
  return totalSeconds * pxPerSecond.value;
});

// 日期段
const dateSegments = computed(() => {
  const days = [];
  let cur = new Date(queryStart);
  while (cur <= queryEnd) {
    const next = new Date(cur);
    next.setHours(24, 0, 0, 0);
    let segEnd = next > queryEnd ? queryEnd : next;
    const seconds = (segEnd - cur) / 1000;
    days.push({
      label: cur.toISOString().slice(0, 10),
      width: seconds * pxPerSecond.value
    });
    cur = new Date(segEnd.getTime() + 1000);
  }
  return days;
});

// 刻度
const ticks = computed(() => {
  const res = [];
  const totalSeconds = (queryEnd - queryStart) / 1000;
  const step = 300; // 5分钟刻度
  for (let s = 0; s <= totalSeconds; s += step) {
    const time = new Date(queryStart.getTime() + s * 1000);
    const isHour = time.getMinutes() === 0;
    const hasData = playlist.value.some(
      seg => s >= seg.startOffset && s < seg.startOffset + seg.duration
    );
    res.push({
      position: s * pxPerSecond.value,
      label: isHour ? `${String(time.getHours()).padStart(2, "0")}:00` : "",
      isHour,
      hasData
    });
  }
  return res;
});

// 播放位置 X 坐标
const playheadX = computed(() => globalCurrentTime.value * pxPerSecond.value);

// 拖拽逻辑
function onTimelineMouseDown(e) {
  updateDragPosition(e);
  document.addEventListener("mousemove", updateDragPosition);
  document.addEventListener("mouseup", onTimelineMouseUp);
}
function updateDragPosition(e) {
  const rect = video.value.closest(".playback-container").querySelector(".timeline").getBoundingClientRect();
  const x = Math.max(0, Math.min(e.clientX - rect.left, timelineWidth.value));
  globalCurrentTime.value = x / pxPerSecond.value;
}
function onTimelineMouseUp() {
  seekGlobal(globalCurrentTime.value);
  playVideo();
  document.removeEventListener("mousemove", updateDragPosition);
  document.removeEventListener("mouseup", onTimelineMouseUp);
}

// 初始化
onMounted(() => {
  // 找到 playlist 中最早的片段
  if (playlist.value.length > 0) {
    const firstSeg = playlist.value.reduce((prev, cur) =>
      cur.startOffset < prev.startOffset ? cur : prev
    );
    seekGlobal(firstSeg.startOffset);
    playVideo();
  }
});
</script>

<style scoped>
.playback-container {
  width: 100%;
  max-width: 1200px;
}
.video-wrapper {
  position: relative;
}
.video-player {
  width: 100%;
  background: black;
  height: 80vh;
}
.center-control {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 40px;
  padding: 10px 20px;
  border-radius: 50%;
  cursor: pointer;
  user-select: none;
}
.timeline-wrapper {
  overflow-x: auto;
  background: #222;
  padding-top: 4px;
  cursor: pointer;
}
.date-row {
  display: flex;
  color: #fff;
  font-size: 12px;
  background: #333;
}
.date-segment {
  text-align: center;
  border-right: 1px solid #555;
}
.timeline {
  position: relative;
  height: 24px;
  background: #222;
  margin-right: 10px; /* 留出刻度线的宽度 */
  margin-left: 10px; /* 留出刻度线的宽度 */
}
.tick {
  position: absolute;
  bottom: 0;
  width: 1px;
  background: #666;
}
.hour-tick {
  background: #aaa;
}
.tick-label {
  position: absolute;
  bottom: 100%;
  left: -10px;
  font-size: 10px;
  color: #fff;
}
.has-data {
  background: green;
}
.playhead {
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background: red;
}
</style>
