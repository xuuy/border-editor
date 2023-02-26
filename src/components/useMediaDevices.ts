import {
  useSupported,
  ConfigurableNavigator,
  defaultNavigator,
} from '@vueuse/core'
import { computed, ComputedRef, onScopeDispose, Ref, shallowRef } from 'vue'

export interface UseMediaDevicesOptions extends ConfigurableNavigator {
  constraints?: MediaStreamConstraints
}

export interface UseMediaDevicesReturn {
  isSupported: Ref<boolean>
  stream: Ref<undefined | MediaStream>
  error: Ref<unknown | null>
  isActive: ComputedRef<boolean>
  start: () => Promise<void>
  stop: () => Promise<void>
}

const defaultConstraints: MediaStreamConstraints = {
  video: true,
  audio: true,
}

export function useMediaDevices(
  options?: UseMediaDevicesOptions
): UseMediaDevicesReturn {
  const { constraints = defaultConstraints, navigator = defaultNavigator } =
    options || {}

  const isSupported = useSupported(
    () => navigator && 'mediaDevices' in navigator
  )

  const stream = shallowRef<undefined | MediaStream>(undefined)
  const error = shallowRef<unknown | null>(null)

  async function capture() {
    if (!isSupported.value) {
      return
    }

    try {
      stream.value = await navigator?.mediaDevices.getUserMedia(constraints)
    } catch (err) {
      error.value = err
    }
    return
  }

  const isActive = computed((): boolean => {
    return stream.value?.active || false
  })
  const tracks = computed((): MediaStreamTrack[] => {
    return stream.value?.getTracks() || []
  })

  async function stop() {
    if (isActive.value) {
      for (const track of tracks.value) {
        const isLive = track.readyState === 'live'
        // const isVideo = track.kind === 'video'
        if (isLive) {
          track.stop()
        }
      }
      stream.value = undefined
    }
  }

  onScopeDispose(() => {
    stop()
  })

  return {
    isSupported,
    stream,
    error,
    isActive,
    start: capture,
    stop,
  }
}
