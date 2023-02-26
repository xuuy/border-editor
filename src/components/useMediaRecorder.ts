import { computed, onScopeDispose, ref, Ref, watch } from 'vue'
import { useMediaDevices } from './useMediaDevices'
import chalk from './log'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export interface UseMediaRecorderOptions {
  mimeType?: string
  kind?: 'video' | 'audio'

  mode?: 'camera' | 'canvas'
}

export interface UseMediaRecorderReturn {
  recorder: Ref<MediaRecorder | undefined>
  stream: Ref<MediaStream | undefined>
  chunks: Ref<Blob[]>
  start: () => Promise<void>
  stop: () => Promise<void>
  pause: () => Promise<void>
  resume: () => Promise<void>
}

const mime: Record<string, string[]> = {
  // text: ['text/plain', 'text/html', 'text/css', 'text/javascript'],
  // image: ['image/gif', 'image/png', 'image/jpeg', 'image/bmp', 'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon'],
  audio: ['audio/midi', 'audio/mpeg', 'audio/webm', 'audio/ogg', 'audio/wav'],
  video: ['video/webm', 'video/ogg'],
  // application: ['application/octet-stream', 'application/pkcs12', 'application/vnd.mspowerpoint', 'application/xhtml+xml', 'application/xml', 'application/pdf']
}

const defaultAudioMIME = 'audio/webm'
const defaultVideoMIME = 'video/webm'

const isSupportedType = MediaRecorder.isTypeSupported

export function useMediaRecorder(
  options: UseMediaRecorderOptions
): UseMediaRecorderReturn {
  const { mimeType = 'unkwown', kind = 'video', mode = 'camera' } = options
  let stream = ref<MediaStream | undefined>(undefined)

  let element: HTMLCanvasElement = document.createElement('canvas')

  const appendElement = () => {
    document.body.append(element)
  }
  const removeElement = () => {
    document.body.removeChild(element)
  }
  if (mode === 'canvas') {
    appendElement()
  }
  chalk.blue('[media recorder]')
  const mediaDevice = useMediaDevices()
  const mediaRecorder = ref<MediaRecorder | undefined>()
  const mime = computed((): string => {
    const isSupported = isSupportedType(mimeType)
    if (kind === 'video' && !isSupported) {
      return defaultVideoMIME
    }
    if (kind === 'audio' && !isSupported) {
      return defaultAudioMIME
    }
    return mimeType
  })

  const chunks = ref<Blob[]>([])
  const available = (event: BlobEvent) => {
    chunks.value.push(event.data)
  }

  const isActive = computed((): boolean => {
    return (
      (mediaRecorder.value?.state &&
        mediaRecorder.value?.state !== 'inactive') ||
      false
    )
  })

  watch(stream, () => {
    if (stream.value) {
      console.log('[record]: init', stream.value, mime.value)
      mediaRecorder.value = new MediaRecorder(stream.value, {
        mimeType: mime.value,
      })

      mediaRecorder.value.addEventListener('dataavailable', available)
      mediaRecorder.value.addEventListener('start', () => {
        console.log('[record]: start', mediaRecorder.value?.state)
      })
      mediaRecorder.value.addEventListener('stop', () => {
        console.log('[record]: stop', mediaRecorder.value?.state)
      })
    } else {
      // cleanup()
    }
  })

  const cleanup = () => {
    mediaRecorder.value?.removeEventListener('dataavailable', available)
    mediaRecorder.value?.removeEventListener('start', () => {})
    // mediaRecorder.value?.removeEventListener('stop')
    // mediaRecorder.value?.removeEventListener('pause')
    // mediaRecorder.value?.removeEventListener('error')
    // mediaRecorder.value?.removeEventListener('resume')
  }

  async function start() {
    chunks.value = []
    if (mode === 'camera') {
      await mediaDevice.start()
      stream.value = mediaDevice.stream.value
    } else if (mode === 'canvas') {
      stream.value = element?.captureStream()
    }
    await sleep(200)
    mediaRecorder.value?.start()
  }

  async function stop() {
    console.log('device is stopping', isActive.value)
    if (isActive.value) {
      await mediaDevice.stop()
      mediaRecorder.value?.stop()
      await sleep(200)

      console.log('device ------>', stream.value)
    }
  }

  async function pause() {
    mediaRecorder.value?.pause()
  }

  async function resume() {
    mediaRecorder.value?.resume()
  }

  onScopeDispose(() => {
    stop()
    cleanup()
    removeElement()
  })

  return {
    recorder: mediaRecorder,
    stream,
    chunks,
    start,
    stop,
    pause,
    resume,
  }
}
