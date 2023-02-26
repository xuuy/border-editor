
<script setup lang="ts">
import { ref, onMounted, computed, VNodeRef, watch } from 'vue'
import { useMediaDevices } from './useMediaDevices'
import { useMediaRecorder } from './useMediaRecorder'

const url = ref()
const el = ref<HTMLVideoElement | null>(null)
const mode = ref<'canvas' | 'camera'>('camera')

const options = [
  {
    label: 'canvas',
    value: 'canvas'
  },
  {
    label: 'camera',
    value: 'camera'
  },
]

const canvasElement = document.getElementById('media') as HTMLCanvasElement
const mediaRecorder = useMediaRecorder({
  mode: mode.value,
  mimeType: 'video/mp4'
})


watch(mediaRecorder.stream, () => {
  if (mediaRecorder.stream) {
    if (el.value) {
      el.value.srcObject = mediaRecorder.stream.value!
    }
    console.log('xxxxxxx', el.value, mediaRecorder.stream)
  }
})

const start = async () => {
  mediaRecorder.start()
}
const stop = async () => {
  mediaRecorder.stop().then(() => {
    url.value = URL.createObjectURL(
      new Blob(mediaRecorder.chunks.value, {
        type: mediaRecorder.recorder.value?.mimeType,
      })
    )
  })
}

const draw = () => {
  const ctx = canvasElement?.getContext('2d')!
  ctx.fillStyle = 'red'
  ctx.rect(0, 0, 10, 10)
  ctx.fill()

  ctx.beginPath()
  ctx.arc(20, 20, 10, 0, 360)
  ctx.closePath()
  ctx.fill()
}

onMounted(() => {
  // console.log('xxxxxxx', el.value?.srcObject)
})
</script>

<template>
  <div class="container">
    <div id="device" class="device"></div>
    <canvas id="media"></canvas>
    <video :src="url" ref="el" controls></video>
  </div>

  <div class="actions">
    <el-button type="primary" @click="start">start record</el-button>
    <el-button type="primary" @click="stop">stop record</el-button>
  </div>
  <el-row>
    <el-select v-model="mode">
      <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>
  </el-row>
</template>

<style scoped>
.container {
  display: flex;
  gap: 10px;
}

.device {
  display: inline-block;
  width: 375px;
  height: 667px;
  background-color: #e7e7e7;
}

canvas#media {
  width: 375px;
  height: 667px;
  background-color: #e7e7e7;
}

video {
  width: 375px;
  height: 667px;
  background-color: #e7e7e7;
  object-fit: contain;
}
</style>
