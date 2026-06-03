<script setup lang="ts">
import { watchEffect, onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'
import { useTres, useLoader } from '@tresjs/core'
import { SCENE_BACKGROUND } from '~/config/criticalAssets'
import { useAsset } from '~/composables/useAsset'

const WEBGL_GATE_ID = 'webgl-scene'

const { scene } = useTres()
const { state: texture } = useLoader(THREE.TextureLoader, useAsset(SCENE_BACKGROUND))

const loader = useAppLoader()
const resolveWebGLGate = ref<(() => void) | null>(null)
const gateResolved = ref(false)

onMounted(() => {
  resolveWebGLGate.value = loader.registerResolvableGate(WEBGL_GATE_ID)
})

watchEffect(() => {
  const tex = texture.value
  const currentScene = scene.value
  if (!tex || !currentScene) return

  tex.colorSpace = THREE.SRGBColorSpace
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping

  currentScene.background = tex
  currentScene.backgroundIntensity = 0.1

  if (!gateResolved.value && resolveWebGLGate.value) {
    gateResolved.value = true
    resolveWebGLGate.value()
  }
})

onUnmounted(() => {
  if (scene.value) {
    scene.value.background = null
  }
  gateResolved.value = false
  resolveWebGLGate.value = null
})
</script>

<template>
  <!-- Logic-only; scene.background is applied in script -->
</template>
