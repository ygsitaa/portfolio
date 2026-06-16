import { ref, computed, readonly, toValue, type MaybeRefOrGetter } from 'vue'
import type { OrbitalItemData } from '~/data/orbitalItems'

export interface OrbitalConfig {
  ringRadius: number
  ringTilt: number      // radians — tilt of the orbital plane
  activeZOffset: number // how far active item pulls toward camera
  activeScale: number   // scale of the active item
  inactiveScale: number
}

const DEFAULT_CONFIG: OrbitalConfig = {
  ringRadius: 2.25,
  ringTilt: -0.10,       // ~20 degrees
  activeZOffset: 0.75,
  activeScale: 0.55,
  inactiveScale: 0.45,
}

// Normalize angle to [-PI, PI]
function normalizeAngle(angle: number): number {
  let a = angle % (Math.PI * 2)
  if (a > Math.PI) a -= Math.PI * 2
  if (a < -Math.PI) a += Math.PI * 2
  return a
}

export function useOrbitalNavigation(
  items: MaybeRefOrGetter<OrbitalItemData[]>,
  config: Partial<OrbitalConfig> = {},
) {
  const cfg = { ...DEFAULT_CONFIG, ...config }

  const activeIndex = ref(0)
  const itemCount = toValue(items).length
  const angleStep = (Math.PI * 2) / itemCount

  // Target rotation for GSAP
  const targetRotation = ref(0)
  // Plain object for current rotation to avoid Vue reactivity spam
  const currentRotation = { value: 0 }
  const isAnimating = ref(false)

  /**
   * Calculate a 0-1 factor of how "active" an item is based on its angle.
   * 1.0 when perfectly at the front (angle = 0).
   */
  function getActiveFactor(angle: number): number {
    const dist = Math.abs(normalizeAngle(angle))
    // Falloff range is half an angle step
    const maxDist = angleStep * 0.6
    return Math.max(0, 1 - (dist / maxDist))
  }

  function getContinuousPosition(angle: number): { x: number; y: number; z: number } {
    const factor = getActiveFactor(angle)
    
    // Base orbital position
    const x = cfg.ringRadius * Math.sin(angle)
    const baseY = cfg.ringRadius * Math.cos(angle) * Math.sin(cfg.ringTilt)
    const baseZ = cfg.ringRadius * Math.cos(angle) * Math.cos(cfg.ringTilt)

    // Pull toward camera and center when active
    const activeX = x * (1 - factor) // centers it as it gets active
    const activeY = baseY - (0.1 * factor)
    const activeZ = baseZ + (cfg.activeZOffset * factor)

    return { x: activeX, y: activeY, z: activeZ }
  }

  function getContinuousScale(angle: number): number {
    const factor = getActiveFactor(angle)
    // Add easing to the scale factor
    const easeFactor = factor * factor * (3 - 2 * factor) // smoothstep
    return cfg.inactiveScale + easeFactor * (cfg.activeScale - cfg.inactiveScale)
  }

  function getContinuousOpacity(angle: number): number {
    const factor = getActiveFactor(angle)
    if (factor > 0) return 0.6 + (0.4 * factor)
    
    const depth = Math.cos(angle)
    return 0.15 + (depth + 1) * 0.225
  }

  function getContinuousEmissive(angle: number): number {
    const factor = getActiveFactor(angle)
    return 0.08 + factor * (0.82)
  }

  function navigateNext() {
    if (isAnimating.value) return
    activeIndex.value = (activeIndex.value + 1) % itemCount
    targetRotation.value -= angleStep
    isAnimating.value = true
  }

  function navigatePrev() {
    if (isAnimating.value) return
    activeIndex.value = (activeIndex.value - 1 + itemCount) % itemCount
    targetRotation.value += angleStep
    isAnimating.value = true
  }

  function navigateTo(index: number) {
    if (isAnimating.value || index === activeIndex.value) return
    
    let diff = index - activeIndex.value
    const halfCount = itemCount / 2
    
    // Adjust diff for wrap-around to find shortest path
    if (diff > halfCount) {
      diff -= itemCount
    } else if (diff < -halfCount) {
      diff += itemCount
    }

    activeIndex.value = index
    targetRotation.value -= diff * angleStep
    isAnimating.value = true
  }

  function finishAnimation() {
    isAnimating.value = false
  }

  const activeItem = computed<OrbitalItemData | undefined>(() => {
    const list = toValue(items)
    return list[activeIndex.value]
  })

  return {
    activeIndex: readonly(activeIndex),
    activeItem,
    targetRotation,
    currentRotation,
    isAnimating,
    itemCount,
    angleStep,
    config: cfg,

    getContinuousPosition,
    getContinuousScale,
    getContinuousOpacity,
    getContinuousEmissive,
    
    navigateNext,
    navigatePrev,
    navigateTo,
    finishAnimation,
  }
}
