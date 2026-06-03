<script setup lang="ts">
import { shallowRef, onMounted, ref, computed, onUnmounted } from 'vue'
import * as THREE from 'three'
import gsap from 'gsap'
import type { OrbitalItemData } from '~/data/orbitalItems'
import { useSharedOrbitalNavigation } from '~/composables/useSharedOrbitalNavigation'
import { useAsset } from '~/composables/useAsset'

const props = defineProps<{
  item: OrbitalItemData
  index: number
}>()

const emit = defineEmits<{
  activateItem: [itemId: string, itemType: 'about' | 'project']
}>()

const nav = useSharedOrbitalNavigation()

// Refs for the mesh and material
const meshRef = shallowRef<THREE.Mesh | null>(null)
const materialRef = shallowRef<THREE.MeshStandardMaterial | null>(null)
const textureRef = shallowRef<THREE.CanvasTexture | null>(null)

// Activation state and animation
const isActivating = ref(false)
const activationScale = ref(1)
const activationEmissiveBoost = ref(0)

// Computed: check if this item is currently active
const isActive = computed(() => nav.activeItem.value?.id === props.item.id)

// Resolve image URL synchronously to ensure Nuxt context is available
const imageUrl = useAsset(`/images/${props.item.id}.jpg`)

/**
 * Handle item activation with animation feedback
 */
async function handleActivation() {
  // Only allow activation if this item is active and not already animating
  if (!isActive.value || isActivating.value) return

  isActivating.value = true

  // Play activation animation: scale pulse and glow effect
  const animationPromises = [
    // Scale pulse
    gsap.to(activationScale, {
      value: 1.15,
      duration: 0.15,
      ease: 'power2.out',
    }).then(() => 
      gsap.to(activationScale, {
        value: 1,
        duration: 0.2,
        ease: 'back.out',
      })
    ),
    // Emissive intensity spike
    gsap.to(activationEmissiveBoost, {
      value: 0.5,
      duration: 0.1,
      ease: 'power2.out',
    }).then(() =>
      gsap.to(activationEmissiveBoost, {
        value: 0,
        duration: 0.3,
        ease: 'power2.in',
      })
    ),
  ]

  await Promise.all(animationPromises)

  isActivating.value = false

  // Emit the activation event
  emit('activateItem', props.item.id, props.item.type)
}

/**
 * Set up keyboard listener for Enter key
 */
function setupKeyboardListener() {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Only listen for Enter key when this item is active
    if (e.key === 'Enter' && isActive.value) {
      e.preventDefault()
      handleActivation()
    }
  }

  window.addEventListener('keydown', handleKeyPress)

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyPress)
  })
}

/**
 * Set up click listener for mouse activation
 */
function setupClickListener() {
  if (typeof window === 'undefined') return

  const handleClick = () => {
    if (isActive.value) {
      handleActivation()
    }
  }

  meshRef.value?.addEventListener('click', handleClick as any)

  onUnmounted(() => {
    meshRef.value?.removeEventListener('click', handleClick as any)
  })
}

// Self-rotation animation (only for active item)
const { onBeforeRender } = useLoop()
onBeforeRender(({ elapsed }: any) => {
  // Compute global angle for this item
  const angle = props.index * nav.angleStep + nav.currentRotation.value
  
  // Get continuous properties based on the angle
  const pos = nav.getContinuousPosition(angle)
  let scale = nav.getContinuousScale(angle)
  const opacity = nav.getContinuousOpacity(angle)
  const emissive = nav.getContinuousEmissive(angle)

  // Apply activation scale animation
  scale *= activationScale.value

  if (meshRef.value) {
    // Only rotate if this is the active item
    if (isActive.value) {
      meshRef.value.rotation.y = elapsed * props.item.selfRotationSpeed
    } else {
      meshRef.value.rotation.y = 0  // No rotation for inactive items
    }

    // Update position and scale smoothly
    meshRef.value.position.set(pos.x, pos.y + 0.4, pos.z)
    meshRef.value.scale.set(scale, scale, scale)
  }

  if (materialRef.value) {
    materialRef.value.emissiveIntensity = emissive + activationEmissiveBoost.value
    materialRef.value.opacity = opacity
  }
})

// Create a dynamic canvas texture for the "card with image through mask" look
onMounted(() => {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Create texture object first so callbacks can update it
  const textureObj = new THREE.CanvasTexture(canvas)
  textureObj.colorSpace = THREE.SRGBColorSpace
  textureRef.value = textureObj

  // Background (dark with colored border)
  ctx.fillStyle = '#e0efe580'
  ctx.fillRect(0, 0, size, size)

  // Inner mask/card area
  ctx.fillStyle = props.item.color
  ctx.globalAlpha = 0
  ctx.fillRect(32, 32, size - 64, size - 64)
  ctx.globalAlpha = 1.0

  // Create two materials:
  // Material 1: Textured (for front/back faces)
  const texturedMaterial = new THREE.MeshStandardMaterial({
    map: textureObj,
    emissive: props.item.emissiveColor,
    emissiveMap: textureObj,
    metalness: 0.3,
    roughness: 0.4,
    transparent: true,
  })

  // Material 2: Plain color (for edges/sides)
  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: props.item.color,  // or use props.item.emissiveColor, or '#000000'
    metalness: 0.5,
    roughness: 0.5,
    transparent: true,
    opacity: 0.6,  // adjust as needed
  })

  // Apply materials array to the mesh
  if (meshRef.value) {
    meshRef.value.material = [
      edgeMaterial,
      edgeMaterial,
      edgeMaterial,
      edgeMaterial,
      texturedMaterial,      // front face (index 4)
      texturedMaterial,      // back face (index 5)
    ]
  }

  // Load and draw image, if not, Draw Emoji as placeholder for image
  const img = new Image()
  img.onload = () => {
    // Fill the entire canvas while maintaining aspect ratio (no black bars)
    const iw = img.width
    const ih = img.height

    // Use Math.max to ensure image fills the entire canvas
    const scale = Math.max(size / iw, size / ih)

    // Scaled dimensions
    const drawWidth = iw * scale
    const drawHeight = ih * scale

    // Center the image (overflow will be clipped by canvas)
    const x = size / 2 - drawWidth / 2
    const y = size / 2 - drawHeight / 2

    ctx.drawImage(
      img,
      x,  // x position (centered)
      y,  // y position (centered)
      drawWidth,  // width
      drawHeight   // height
    )
    
    // Update the texture after drawing
    textureObj.needsUpdate = true
  }

  img.onerror = () => {
    // Fallback to emoji if image fails to load
    ctx.font = '200px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(props.item.iconEmoji, size / 2, size / 2 + 20)
    
    
    // Update the texture after drawing
    textureObj.needsUpdate = true
  }
  
  // Trigger image load
  img.src = imageUrl  // Reference your image file

  // Set up activation listeners
  setupKeyboardListener()
  setupClickListener()
})
</script>

<template>
  <TresMesh ref="meshRef">
    <!-- Use a textured plane/card instead of primitives -->
    <!-- Using a double-sided plane -->
    <TresBoxGeometry :args="[1.1, 1.1, 0.05]" />

    
  </TresMesh>
</template>

