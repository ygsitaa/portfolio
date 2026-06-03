import { onMounted, onUnmounted } from 'vue'

interface WheelNavigationOptions {
  onNext: () => void
  onPrev: () => void
  cooldown?: number  // ms between triggers
}

export function useWheelNavigation(options: WheelNavigationOptions) {
  const { onNext, onPrev, cooldown = 250 } = options

  let lastTrigger = 0
  let accumulatedDelta = 0
  let resetTimeout: ReturnType<typeof setTimeout> | null = null

  function handleWheel(e: WheelEvent) {
    e.preventDefault()

    const now = Date.now()

    // Accumulate delta for smooth trackpad scrolling
    accumulatedDelta += e.deltaY

    // Reset accumulator after inactivity
    if (resetTimeout) clearTimeout(resetTimeout)
    resetTimeout = setTimeout(() => {
      accumulatedDelta = 0
    }, 150)

    // Cooldown check
    if (now - lastTrigger < cooldown) return

    // Threshold for triggering navigation
    if (Math.abs(accumulatedDelta) > 50) {
      if (accumulatedDelta > 0) {
        onNext()
      } else {
        onPrev()
      }
      lastTrigger = now
      accumulatedDelta = 0
    }
  }

  onMounted(() => {
    document.addEventListener('wheel', handleWheel, { passive: false })
  })

  onUnmounted(() => {
    document.removeEventListener('wheel', handleWheel)
    if (resetTimeout) clearTimeout(resetTimeout)
  })
}
