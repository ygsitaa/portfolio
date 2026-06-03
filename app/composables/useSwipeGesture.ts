import { onMounted, onUnmounted } from 'vue'

interface SwipeGestureOptions {
  onSwipeLeft: () => void
  onSwipeRight: () => void
  threshold?: number       // minimum px to trigger swipe
  velocityThreshold?: number // minimum px/ms for velocity-based trigger
}

export function useSwipeGesture(options: SwipeGestureOptions) {
  const {
    onSwipeLeft,
    onSwipeRight,
    threshold = 40,
    velocityThreshold = 0.3,
  } = options

  let startX = 0
  let startY = 0
  let startTime = 0
  let tracking = false

  function handleTouchStart(e: TouchEvent) {
    const touch = e.touches[0]
    startX = touch.clientX
    startY = touch.clientY
    startTime = Date.now()
    tracking = true
  }

  function handleTouchMove(e: TouchEvent) {
    if (!tracking) return
    // Prevent vertical scroll if horizontal swipe is dominant
    const touch = e.touches[0]
    const dx = Math.abs(touch.clientX - startX)
    const dy = Math.abs(touch.clientY - startY)
    if (dx > dy && dx > 10) {
      e.preventDefault()
    }
  }

  function handleTouchEnd(e: TouchEvent) {
    if (!tracking) return
    tracking = false

    const touch = e.changedTouches[0]
    const dx = touch.clientX - startX
    const dy = touch.clientY - startY
    const dt = Date.now() - startTime
    const velocity = Math.abs(dx) / dt

    // Only register horizontal swipes
    if (Math.abs(dy) > Math.abs(dx)) return

    // Threshold-based or velocity-based trigger
    if (Math.abs(dx) > threshold || velocity > velocityThreshold) {
      if (dx < 0) {
        onSwipeLeft()
      } else {
        onSwipeRight()
      }
    }
  }

  onMounted(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })
  })

  onUnmounted(() => {
    document.removeEventListener('touchstart', handleTouchStart)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
  })
}
