import { provide, inject } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { OrbitalItemData } from '~/data/orbitalItems'

const ORBITAL_NAV_KEY = Symbol('orbital-navigation')

export interface OrbitalNavigationAPI {
  activeIndex: Readonly<Ref<number>>
  activeItem: ComputedRef<OrbitalItemData | undefined>
  targetRotation: Ref<number>
  currentRotation: { value: number }
  isAnimating: Ref<boolean>
  itemCount: number
  angleStep: number
  config: {
    ringRadius: number
    ringTilt: number
    activeZOffset: number
    activeScale: number
    inactiveScale: number
  }
  getContinuousPosition: (angle: number) => { x: number; y: number; z: number }
  getContinuousScale: (angle: number) => number
  getContinuousOpacity: (angle: number) => number
  getContinuousEmissive: (angle: number) => number
  navigateNext: () => void
  navigatePrev: () => void
  finishAnimation: () => void
}

export function provideOrbitalNavigation(nav: OrbitalNavigationAPI) {
  provide(ORBITAL_NAV_KEY, nav)
}

export function useSharedOrbitalNavigation(): OrbitalNavigationAPI {
  const nav = inject<OrbitalNavigationAPI>(ORBITAL_NAV_KEY)
  if (!nav) {
    throw new Error('useSharedOrbitalNavigation must be used within a provider')
  }
  return nav
}
