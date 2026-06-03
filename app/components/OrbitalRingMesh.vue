<script setup lang="ts">
import { shallowRef } from 'vue'
import * as THREE from 'three'

defineProps<{
  rotationValue: number
}>()

const ringRef = shallowRef<THREE.Mesh | null>(null)

// Subtle idle pulsing of the ring emissive
const { onBeforeRender } = useLoop()
let pulseIntensity = 0.15

onBeforeRender(({ elapsed }: any) => {
  pulseIntensity = 0.1 + Math.sin(elapsed * 1.2) * 0.05
  if (ringRef.value) {
    const mat = (ringRef.value as any).material as THREE.MeshStandardMaterial
    if (mat) {
      mat.emissiveIntensity = pulseIntensity
    }
  }
})
</script>

<template>
  <TresGroup :rotation="[0.35, 0, 0]">

  </TresGroup>
</template>
