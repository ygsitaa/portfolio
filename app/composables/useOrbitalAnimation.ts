import { ref, watch, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

interface AnimationOptions {
  targetRotation: ReturnType<typeof ref<number>>
  currentRotation: { value: number }
  isAnimating: ReturnType<typeof ref<boolean>>
  finishAnimation: () => void
}

export function useOrbitalAnimation(options: AnimationOptions) {
  const { targetRotation, currentRotation, isAnimating, finishAnimation } = options

  let activeTween: gsap.core.Tween | null = null

  // Watch for target rotation changes and animate with GSAP
  watch(targetRotation, (newTarget) => {
    if (activeTween) {
      activeTween.kill()
    }

    activeTween = gsap.to(currentRotation, {
      value: newTarget,
      duration: 0.75,
      ease: 'back.out(0.5)',
      onComplete: () => {
        finishAnimation()
        activeTween = null
      },
    })
  })

  /**
   * Create a GSAP timeline for active item transition.
   * Returns an object with reactive animation values.
   */
  function createActiveTransition() {
    const progress = ref(0)

    const tl = gsap.timeline()
    tl.to(progress, {
      value: 1,
      duration: 0.7,
      ease: 'back.out(1.2)',
    })

    return { progress, timeline: tl }
  }

  /**
   * Animate a single property with GSAP
   */
  function animateValue(
    target: { value: number },
    to: number,
    duration: number = 0.6,
    ease: string = 'power2.out',
  ) {
    return gsap.to(target, { value: to, duration, ease })
  }

  // Cleanup
  onUnmounted(() => {
    if (activeTween) {
      activeTween.kill()
    }
  })

  return {
    createActiveTransition,
    animateValue,
  }
}
