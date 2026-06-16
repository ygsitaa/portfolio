<script setup lang="ts">
import { shallowRef, computed, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import type { OrbitalItemData } from '~/data/orbitalItems'
import { isProjectItem } from '~/composables/useOrbitalItemType'
import { useSharedOrbitalNavigation } from '~/composables/useSharedOrbitalNavigation'
import { useOrbitalAnimation } from '~/composables/useOrbitalAnimation'
import { useSwipeGesture } from '~/composables/useSwipeGesture'
import { useWheelNavigation } from '~/composables/useWheelNavigation'

const props = defineProps<{
  items: OrbitalItemData[]
}>()

// --- Orbital navigation state (injected from app.vue) ---
const nav = useSharedOrbitalNavigation()

// --- Emits for parent component ---
const emit = defineEmits<{
  openAboutPortal: []
}>()

// --- GSAP animation engine ---
useOrbitalAnimation({
  targetRotation: nav.targetRotation,
  currentRotation: nav.currentRotation,
  isAnimating: nav.isAnimating,
  finishAnimation: nav.finishAnimation,
})

/**
 * Handle item activation - route based on item type
 */
function handleItemActivation(itemId: string, itemType: 'about' | 'project') {
  const item = props.items.find(i => i.id === itemId)
  if (!item) return

  if (itemType === 'about') {
    // Emit event to parent to open portal
    emit('openAboutPortal')
  } else if (itemType === 'project' && isProjectItem(item)) {
    // Open project in new tab
    if (item.url) {
      window.open(item.url, '_blank')
    }
  }
}

// --- Input handlers ---
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    nav.navigateNext()
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    nav.navigatePrev()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// Swipe gestures (mobile)
useSwipeGesture({
  onSwipeLeft: () => nav.navigateNext(),
  onSwipeRight: () => nav.navigatePrev(),
})

// Mouse wheel
useWheelNavigation({
  onNext: () => nav.navigateNext(),
  onPrev: () => nav.navigatePrev(),
})

// Expose active item for HUD
defineExpose({
  activeItem: nav.activeItem,
  navigateNext: nav.navigateNext,
  navigatePrev: nav.navigatePrev,
  navigateTo: nav.navigateTo,
})
</script>

<template>
  <TresCanvas
    shadows
    clear-color="#050706"
    :antialias="true"
    window-size
    class="orbital-canvas"
  >
    <OrbitalSceneBackground />

    <!-- Camera (isolated to fix TresContext error) -->
    <OrbitalCamera />

    <!-- === Atmospheric Lighting === -->
    <!-- Deep ambient fill -->
    <TresAmbientLight :intensity="1.5" color="#0a1f12" />

    <!-- Main key light — warm amber from top-right -->
    <TresSpotLight
      :position="[3, 5, 6]"
      :intensity="200"
      color="#d4a574"
      :angle="0.6"
      :penumbra="0.8"
      :decay="1.5"
      cast-shadow
    />

    <!-- Cool blue fill light from left -->
    <TresPointLight
      :position="[-4, 2, 4]"
      :intensity="100"
      color="#4a6fa5"
      :decay="2"
    />

    <!-- Warm rim light from below-back -->
    <TresPointLight
      :position="[0, -3, -4]"
      :intensity="80"
      color="#8b4513"
      :decay="2"
    />

    <!-- Active item spotlight — follows center -->
    <TresPointLight
      :position="[0, 1, 5]"
      :intensity="10"
      :color="nav.activeItem.value?.emissiveColor || '#ffffff'"
      :decay="2"
    />

    <!-- === Orbiting Items === -->
    <OrbitalItem
      v-for="(item, i) in items"
      :key="item.id"
      :item="item"
      :index="i"
      @activate-item="handleItemActivation"
    />
  </TresCanvas>
</template>

<style scoped>
.orbital-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>