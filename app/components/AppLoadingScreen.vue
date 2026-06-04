<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAppLoader } from '~/composables/useAppLoader'

const loader = useAppLoader()

const animationClass = ref('app-loading-screen--entering')

const roundedProgress = computed(() => Math.round(loader.displayProgress.value))

const showOverlay = computed(() => loader.isVisible.value)

const showContinueButton = computed(
  () =>
    loader.showContinue.value ||
    loader.phase.value === 'forced',
)

function handleContinue() {
  loader.skip()
}

function handleAnimationEnd() {
  if (loader.phase.value === 'exiting') {
    loader.onExitAnimationEnd()
  }
}

watch(
  () => loader.phase.value,
  (phase) => {
    if (phase === 'exiting') {
      animationClass.value = 'app-loading-screen--exiting'
    }
  },
)

onMounted(() => {
  requestAnimationFrame(() => {
    animationClass.value = 'app-loading-screen--entering'
  })
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="showOverlay"
      class="app-loading-screen"
      :class="animationClass"
      role="dialog"
      aria-modal="true"
      aria-busy="true"
      aria-label="Loading application"
      @animationend="handleAnimationEnd"
    >
      <div class="app-loading-screen__glow" aria-hidden="true" />

      <div class="app-loading-screen__content">
        <p class="app-loading-screen__brand">Daniel Hodiamont</p>
        <p class="app-loading-screen__tagline">Web &amp; UI/UX Designer</p>

        <div
          class="app-loading-screen__progress-wrap"
          role="progressbar"
          :aria-valuenow="roundedProgress"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="`Loading progress ${roundedProgress} percent`"
        >
          <div class="app-loading-screen__track">
            <div
              class="app-loading-screen__fill"
              :style="{ width: `${loader.displayProgress.value}%` }"
            />
          </div>
          <span class="app-loading-screen__percent">{{ roundedProgress }}%</span>
        </div>

        <p class="app-loading-screen__status" aria-live="polite">
          {{ loader.statusMessage.value }}<span v-if="loader.phase.value === 'loading'" class="app-loading-screen__status-dots" aria-hidden="true"></span>
        </p>

        <button
          v-if="showContinueButton"
          type="button"
          class="app-loading-screen__continue"
          @click="handleContinue"
        >
          Continue
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.app-loading-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #050706;
  pointer-events: auto;
}

.app-loading-screen__glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 70% 50% at 50% 45%,
    rgba(19, 52, 109, 0.212),
    transparent 70%
  );
  pointer-events: none;
}

.app-loading-screen__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 1.25rem;
  width: min(90vw, 22rem);
  padding: 2rem;
}

.app-loading-screen__brand {
  font-family: 'Cinzel', serif;
  font-size: clamp(1.25rem, 4vw, 1.75rem);
  font-weight: 700;
  color: #fff;
  text-align: center;
  letter-spacing: 0.12em;
  margin: 0;
  text-transform: uppercase;
  text-shadow:
    0 0 40px rgba(168, 168, 168, 0.25),
    0 0 80px rgba(158, 158, 158, 0.089);
}

.app-loading-screen__tagline {
  font-family: 'Rajdhani', sans-serif;
  font-size: clamp(0.75rem, 2vw, 0.95rem);
  font-weight: 300;
  text-align: center;
  color: rgba(224, 239, 229, 0.45);
  letter-spacing: 0.3em;
  margin: -0.5rem 0 0.5rem;
  text-transform: uppercase;
}

.app-loading-screen__progress-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.app-loading-screen__track {
  width: 100%;
  height: 3px;
  background: rgba(224, 239, 229, 0.12);
  border-radius: 2px;
  overflow: hidden;
}

.app-loading-screen__fill {
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(0, 255, 128, 0.6) 0%,
    rgba(0, 255, 128, 1) 100%
  );
  border-radius: 2px;
  box-shadow: 0 0 12px rgba(0, 255, 128, 0.5);
  transition: none;
}

.app-loading-screen__percent {
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(224, 239, 229, 0.7);
  letter-spacing: 0.15em;
  font-variant-numeric: tabular-nums;
}

.app-loading-screen__status {
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.85rem;
  font-weight: 400;
  color: rgba(224, 239, 229, 0.4);
  letter-spacing: 0.08em;
  margin: 0;
  text-transform: uppercase;
}

.app-loading-screen__continue {
  margin-top: 0.5rem;
  padding: 0.5rem 1.25rem;
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #e0efe5;
  background: rgba(0, 255, 128, 0.12);
  border: 1px solid rgba(0, 255, 128, 0.35);
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.app-loading-screen__continue:hover {
  background: rgba(0, 255, 128, 0.2);
  border-color: rgba(0, 255, 128, 0.55);
}

.app-loading-screen__continue:focus-visible {
  outline: 2px solid rgba(0, 255, 128, 0.6);
  outline-offset: 2px;
}

.app-loading-screen__status-dots {
  display: inline-block;
  width: 1.5em;
  text-align: left;
}

.app-loading-screen__status-dots::after {
  content: '';
  animation: loading-dots 1.5s infinite;
}

@keyframes loading-dots {
  0% { content: ''; }
  25% { content: '.'; }
  50% { content: '..'; }
  75% { content: '...'; }
  100% { content: ''; }
}
</style>
