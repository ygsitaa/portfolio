<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import gsap from 'gsap'
import type { OrbitalItemData } from '~/data/orbitalItems'
import type { Locale } from '~/composables/useLocale'
import { getNavHints } from '~/data/i18n'

const props = defineProps<{
  locale: Locale
  activeItem: OrbitalItemData | undefined
  onNavigateNext: () => void
  onNavigatePrev: () => void
}>()

const emit = defineEmits<{
  'update:locale': [locale: Locale]
}>()

const navHints = computed(() => getNavHints(props.locale))

const displayLabel = ref(props.activeItem?.label || '')
const displaySubtitle = ref(props.activeItem?.subtitle || '')
const labelOpacity = ref(1)
const labelY = ref(0)

function animateLabelChange(newItem: OrbitalItemData) {
  gsap.to(labelOpacity, {
    value: 0,
    duration: 0.2,
    ease: 'power1.in',
    onComplete: () => {
      displayLabel.value = newItem.label
      displaySubtitle.value = newItem.subtitle
      labelY.value = 8
      gsap.to(labelOpacity, {
        value: 1,
        duration: 0.35,
        ease: 'power1.out',
      })
      gsap.to(labelY, {
        value: 0,
        duration: 0.35,
        ease: 'power2.out',
      })
    },
  })
}

watch(
  () => props.activeItem,
  (newItem, oldItem) => {
    if (!newItem) return
    const sameItem = oldItem?.id === newItem.id
    const sameText =
      oldItem?.label === newItem.label && oldItem?.subtitle === newItem.subtitle
    if (sameItem && sameText) return
    animateLabelChange(newItem)
  },
)

watch(
  () => props.locale,
  () => {
    const item = props.activeItem
    if (!item) return
    animateLabelChange(item)
  },
)

const activeColor = computed(() => props.activeItem?.emissiveColor || '#00ff80')

function setLocale(next: Locale) {
  emit('update:locale', next)
}
</script>

<template>
  <div class="orbital-hud">
    <!-- Navigation arrows -->
    <button
      class="nav-arrow nav-arrow--left"
      aria-label="Previous item"
      @click="onNavigatePrev"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M15 19l-7-7 7-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <button
      class="nav-arrow nav-arrow--right"
      aria-label="Next item"
      @click="onNavigateNext"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- Active item label -->
    <div
      class="active-label"
      :style="{
        opacity: labelOpacity,
        transform: `translateY(${labelY}px)`,
        '--accent-color': activeColor,
      }"
    >
      <h2 class="active-label__title">{{ displayLabel }}</h2>
      <p class="active-label__subtitle">{{ displaySubtitle }}</p>
    </div>

    <!-- Navigation hints -->
    <div class="nav-hints">
      <span class="nav-hints__text">
        {{ navHints.desktopLine1 }}<br />
        {{ navHints.desktopLine2 }}
      </span>
      <span class="nav-hints__text_mobile">
        {{ navHints.mobileLine1 }}<br />
        {{ navHints.mobileLine2 }}
      </span>
    </div>

    <!-- Decorative corner elements -->
    <div class="corner corner--tl"></div>
    <div class="corner corner--tr"></div>

    <!-- Language selector (below top-right corner) -->
    <div class="lang-switcher" role="group" aria-label="Language">
      <button
        type="button"
        class="lang-switcher__btn"
        :class="{ 'lang-switcher__btn--active': locale === 'en' }"
        :aria-pressed="locale === 'en'"
        @click="setLocale('en')"
      >
        EN
      </button>
      <span class="lang-switcher__sep" aria-hidden="true">|</span>
      <button
        type="button"
        class="lang-switcher__btn"
        :class="{ 'lang-switcher__btn--active': locale === 'fr' }"
        :aria-pressed="locale === 'fr'"
        @click="setLocale('fr')"
      >
        FR
      </button>
    </div>

    <div class="corner corner--bl"></div>
    <div class="corner corner--br"></div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Rajdhani:wght@300;400;500;600&display=swap');

.orbital-hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 6vh;
}

/* --- Navigation arrows --- */
.nav-arrow {
  pointer-events: all;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: 1px solid rgba(0, 255, 128, 0.15);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 255, 128, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
  background: rgba(0, 255, 128, 0.03);
}

.nav-arrow:hover {
  color: #00ff80;
  border-color: rgba(0, 255, 128, 0.5);
  background: rgba(0, 255, 128, 0.08);
  box-shadow: 0 0 20px rgba(0, 255, 128, 0.15);
}

.nav-arrow--left {
  left: 3vw;
}

.nav-arrow--right {
  right: 3vw;
}

/* --- Active label --- */
.active-label {
  text-align: center;
  margin-bottom: 1.5vh;
}

.active-label__title {
  font-family: 'Cinzel', serif;
  font-size: clamp(1.8rem, 3.5vw, 2.8rem);
  font-weight: 600;
  color: var(--accent-color, #00ff80);
  text-transform: uppercase;
  letter-spacing: 0.25em;
  margin: 0;
  text-shadow:
    0 0 30px var(--accent-color, rgba(0, 255, 128, 0.4)),
    0 0 60px var(--accent-color, rgba(0, 255, 128, 0.15));
}

.active-label__subtitle {
  font-family: 'Rajdhani', sans-serif;
  font-size: clamp(0.85rem, 1.5vw, 1.1rem);
  font-weight: 300;
  color: rgba(255, 255, 255, 0.849);
  letter-spacing: 0.15em;
  margin: 0.5rem 0 0;
  text-transform: uppercase;
}

/* --- Nav hints --- */
.nav-hints {
  margin-top: 1.5vh;
}

.nav-hints__text {
  font-family: 'Rajdhani', sans-serif;
  font-size: clamp(0.7rem, 1.2vw, 0.9rem);
  font-weight: 400;
  color: rgba(255, 255, 255, 0.849);
  letter-spacing: 0.2em;
  text-transform: none;
  display: flex;
  flex-direction: column;
  text-align: center;
  /* -webkit-text-stroke: 0.2px white; */
}

.nav-hints__text_mobile {
  font-family: 'Rajdhani', sans-serif;
  font-size: clamp(0.7rem, 1.2vw, 0.9rem);
  font-weight: 400;
  color: rgba(255, 255, 255, 0.849);
  letter-spacing: 0.2em;
  text-transform: none;
  display: none;
  flex-direction: column;
  text-align: center;
}

/* --- Language switcher --- */
.lang-switcher {
  position: absolute;
  top: 22px;
  right: 25px;
  z-index: 11;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  pointer-events: all;
}

.lang-switcher__btn {
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.15em;
  color: #fff;
  background: none;
  border: none;
  padding: 0.15rem 0.25rem;
  cursor: pointer;
  transition: color 0.2s ease;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.lang-switcher__btn:hover {
  color: rgba(0, 255, 128, 0.75);
}

.lang-switcher__btn--active {
  color: rgba(0, 255, 128, 0.45);
  
  cursor: default;
}

.lang-switcher__sep {
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.85rem;
  color: rgba(0, 255, 128, 0.25);
  user-select: none;
}

/* --- Corner decorations --- */
.corner {
  position: absolute;
  width: 30px;
  height: 30px;
  pointer-events: none;
}

.corner--tl {
  top: 20px;
  left: 20px;
  border-top: 1px solid rgba(0, 255, 128, 0.15);
  border-left: 1px solid rgba(0, 255, 128, 0.15);
}
.corner--tr {
  top: 20px;
  right: 20px;
  border-top: 1px solid rgba(0, 255, 128, 0.15);
  border-right: 1px solid rgba(0, 255, 128, 0.15);
}
.corner--bl {
  bottom: 20px;
  left: 20px;
  border-bottom: 1px solid rgba(0, 255, 128, 0.15);
  border-left: 1px solid rgba(0, 255, 128, 0.15);
}
.corner--br {
  bottom: 20px;
  right: 20px;
  border-bottom: 1px solid rgba(0, 255, 128, 0.15);
  border-right: 1px solid rgba(0, 255, 128, 0.15);
}

/* --- Pulse animation for arrows --- */
@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.nav-arrow svg {
  animation: pulse-glow 2.5s ease-in-out infinite;
}

/* --- Mobile responsive --- */
@media (max-width: 1279px) {
  .nav-arrow {
    width: 40px;
    height: 40px;
  }

  .nav-hints__text {
    display: none;
  }

  .nav-hints__text_mobile {
    display: flex;
  }

  .orbital-hud {
    padding-bottom: 4vh;
  }
}

@media (max-width: 749px) {
  .lang-switcher {
    top: 12%;
    right: 42%;
  }
}
</style>
