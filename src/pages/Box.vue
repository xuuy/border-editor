<script setup lang="ts">
import { computed, onScopeDispose, ref, StyleValue, watch } from 'vue';

const getImageInfo = (src: string) => {
  return new Promise<{
    width: number
    height: number
  }>(resolve => {
    const image = new Image()
    image.src = src
    image.onload = () => {
      resolve({
        width: image.width,
        height: image.height
      })
    }
  })
}

const edgeInfo = await getImageInfo((await import('../assets/box/top.png')).default)
const cornerInfo = await getImageInfo((await import('../assets/box/top-left.png')).default)
const contentInfo = await getImageInfo((await import('../assets/center.png')).default)

const ratio = ref(0)
const style = ref({
  corner: ``,
  verticalEdge: ``,
  horizontalEdge: ``,
  content: ``,
})
const wrapWidth = ref(0)

watch(ratio, (v) => {
  const wrapper = 252
  const offset = v * 10
  const w = contentInfo.width - offset
  const h = contentInfo.height - offset
  
  const aspectRatio = w / edgeInfo.width
  const edgeHeight = edgeInfo.height * aspectRatio
  const cornerWidth = cornerInfo.width / cornerInfo.height * edgeHeight
  
  console.log('ratio --->', v, contentInfo, edgeHeight)
  style.value.content = `width: ${w}px; height: ${h}px;`
  style.value.horizontalEdge = `width: ${w}px; height: ${edgeHeight}px;`
  style.value.verticalEdge = `width: ${cornerWidth}px; height: ${h}px;`
  style.value.corner = `width: ${cornerWidth}px; height: ${edgeHeight}px;`

  wrapWidth.value = w + cornerWidth * 2
}, { immediate: true })
</script>

<template>
  
  <div class="flex justify-center bg-black">
    <div class="relative bg-white iphone">
      <div id="editor-zone" class="flex items-center justify-center">
        <div class="flex flex-wrap" style="width: 252px;">
          <img src="../assets/box/top-left.png" :style="style.corner" />
          <img src="../assets/box/top.png" :style="style.horizontalEdge" />
          <img src="../assets/box/top-right.png" :style="style.corner" />
    
          <img src="../assets/box/left.png" :style="style.verticalEdge" />
          <img src="../assets/center.png" :style="style.content"/>
          <img src="../assets/box/right.png" :style="style.verticalEdge"  />
    
          <img src="../assets/box/bottom-left.png" :style="style.corner" />
          <img src="../assets/box/bottom.png" :style="style.horizontalEdge" />
          <img src="../assets/box/bottom-right.png" :style="style.corner" />
        </div>
      </div>

      <footer id="tools" class="absolute bottom-0 left-0 w-full p-4 bg-gray-700 border-t-2 shadow">
        <ElSlider v-model="ratio" :min="-0.5" :max="2.5" :step="0.1" />
      </footer>
    </div>
  </div>
</template>

<style>
.iphone {
  width: 414px;
  height: 896px;
}

#editor-zone {
  height: 66.7%;
}

#tools {
  height: 33.3%;
}
</style>
