<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const overlayRef = ref<HTMLElement | null>(null)
const modalRef = ref<HTMLElement | null>(null)

/**
 * Trigger open animation
 */
function animateOpen() {
  if (!overlayRef.value || !modalRef.value) return

  // Animate background overlay from 0 to 1 opacity
  gsap.fromTo(
    overlayRef.value,
    { opacity: 0 },
    {
      opacity: 1,
      duration: 0.15,
      ease: 'power2.out',
    }
  )

  // Animate modal: from initial state to final state
  gsap.fromTo(
    modalRef.value,
    {
      opacity: 0,
      scale: 0.8,
      y: 20,
    },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.3,
      ease: 'back.out',
    }
  )
}

/**
 * Trigger close animation
 */
async function animateClose() {
  if (!overlayRef.value || !modalRef.value) return

  await Promise.all([
    gsap.to(overlayRef.value, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
    }),
    gsap.to(modalRef.value, {
      scale: 0.9,
      opacity: 0,
      y: 20,
      duration: 0.25,
      ease: 'back.in',
    }),
  ])

  emit('close')
}

/**
 * Handle close button click
 */
function handleClose() {
  animateClose()
}

/**
 * Handle Escape key press
 */
function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.isOpen) {
    e.preventDefault()
    animateClose()
  }
}

onMounted(() => {
  if (props.isOpen) {
    // Trigger animation on next frame to ensure refs are ready
    requestAnimationFrame(() => {
      animateOpen()
    })
  }

  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <Teleport to="body" v-if="isOpen">
    <!-- Background overlay -->
    <div
      ref="overlayRef"
      class="portal-overlay"
      @click="handleClose"
    ></div>

    <!-- Modal container -->
    <div class="portal-container">
      <div
        ref="modalRef"
        class="portal-modal"
        @click.stop
      >
        <!-- Close button -->
        <button
          class="portal-close-btn"
          @click="handleClose"
          aria-label="Close portal"
        >
          <span class="pt-px!">✕</span>
        </button>

        <!-- Content slot -->
        <div class="portal-content">
          <slot></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.portal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 999;
}

.portal-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  pointer-events: none;
}

.portal-modal {
  position: relative;
  background: linear-gradient(135deg, #172a57 0%, #0a1931 60%);
  border: 1px solid rgba(132, 150, 252, 0.3);
  border-radius: 12px;
  padding: 40px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8),
              0 0 40px rgba(192, 132, 252, 0.15);
  pointer-events: auto;
}

.portal-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(192, 132, 252, 0.1);
  color: rgba(192, 132, 252, 0.8);
  font-size: 20px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.portal-close-btn:hover {
  background: rgba(192, 132, 252, 0.2);
  color: rgba(192, 132, 252, 1);
}

.portal-close-btn:active {
  transform: scale(0.95);
}

.portal-content {
  color: #e0e0e0;
  line-height: 1.6;
}

/* Scrollbar styling */
.portal-modal::-webkit-scrollbar {
  width: 8px;
}

.portal-modal::-webkit-scrollbar-track {
  background: rgba(192, 132, 252, 0.05);
  border-radius: 4px;
}

.portal-modal::-webkit-scrollbar-thumb {
  background: rgba(192, 132, 252, 0.3);
  border-radius: 4px;
}

.portal-modal::-webkit-scrollbar-thumb:hover {
  background: rgba(192, 132, 252, 0.5);
}
</style>
