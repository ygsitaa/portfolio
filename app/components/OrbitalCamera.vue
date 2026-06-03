<script setup lang="ts">
import { shallowRef } from 'vue'
import * as THREE from 'three'

const cameraRef = shallowRef<THREE.PerspectiveCamera | null>(null)

// useLoop can safely be called here because this component will be a child of TresCanvas
const { onBeforeRender } = useLoop()

onBeforeRender(({ elapsed }: any) => {
  if (cameraRef.value) {
    cameraRef.value.position.y = 0.8 + Math.sin(elapsed * 0.4) * 0.04
  }
})
</script>

<template>
  <TresPerspectiveCamera
    ref="cameraRef"
    :position="[0, 0.8, 7]"
    :fov="42"
    :look-at="[0, -0.3, 0]"
  />
</template>
