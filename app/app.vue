<script setup lang="ts">
import { shallowRef, ref, computed } from 'vue'
import { getOrbitalItems, getAboutContent } from '~/data/i18n'
import { useOrbitalNavigation } from '~/composables/useOrbitalNavigation'
import { provideOrbitalNavigation } from '~/composables/useSharedOrbitalNavigation'
import { provideLocale, type Locale } from '~/composables/useLocale'
import { useAppLoader } from '~/composables/useAppLoader'

const loader = useAppLoader()
const orbitalRef = shallowRef()

const locale = ref<Locale>('fr')
provideLocale(locale)

const isAboutPortalOpen = ref(false)

const localizedItems = computed(() => getOrbitalItems(locale.value))
const aboutContent = computed(() => getAboutContent(locale.value))

const nav = useOrbitalNavigation(localizedItems)
provideOrbitalNavigation(nav)

function handleOpenAboutPortal() {
  isAboutPortalOpen.value = true
}

function handleCloseAboutPortal() {
  isAboutPortalOpen.value = false
}

function setLocale(next: Locale) {
  locale.value = next
}
</script>

<template>
  <AppLoadingScreen />
  <div
    class="app-container"
    :class="{ 'app-container--blocked': loader.isBlocking.value }"
    :inert="loader.isBlocking.value ? true : undefined"
    :aria-hidden="loader.isBlocking.value ? true : undefined"
  >
    <!-- Header -->
    <div class="header">
      <h1 class="header__name">Daniel Hodiamont</h1>
      <h5 class="header__title">Web & UI/UX Designer</h5>
    </div>

    <!-- 3D Scene -->
    <div class="scene-container">
      <ClientOnly>
        <OrbitalRing
          ref="orbitalRef"
          :items="localizedItems"
          @open-about-portal="handleOpenAboutPortal"
        />
      </ClientOnly>
    </div>

    <!-- HUD Overlay -->
    <OrbitalHUD
      :locale="locale"
      :active-item="nav.activeItem.value"
      :on-navigate-next="nav.navigateNext"
      :on-navigate-prev="nav.navigatePrev"
      @update:locale="setLocale"
    />

    <!-- About Portal Modal -->
    <AboutPortal
      :is-open="isAboutPortalOpen"
      @close="handleCloseAboutPortal"
    >
      <div class="about-content">
        <h2>{{ aboutContent.title }}</h2>
        <p>
          {{ aboutContent.intro.beforeRole }}<code>{{ aboutContent.intro.role }}</code>{{ aboutContent.intro.mid }}<code>{{ aboutContent.intro.location }}</code>{{ aboutContent.intro.after }}
        </p>
        <p>{{ aboutContent.closingParagraph }}</p>

        <h3>{{ aboutContent.contactHeading }}</h3>
        <ul>
          <li>
            <i class="fa-solid fa-envelope"></i>
            <span>{{ aboutContent.contactLabels.email }} {{ aboutContent.contactValues.email }}</span>
          </li>
          <li>
            <i class="fa-brands fa-square-instagram"></i>
            <span>{{ aboutContent.contactLabels.instagram }} {{ aboutContent.contactValues.instagram }}</span>
          </li>
          <li>
            <i class="fa-brands fa-square-linkedin"></i>
            <span>{{ aboutContent.contactLabels.linkedin }} {{ aboutContent.contactValues.linkedin }}</span>
          </li>
        </ul>
      </div>
    </AboutPortal>
  </div>
</template>

<style scoped>
.app-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.app-container--blocked {
  pointer-events: none;
  user-select: none;
}

.header {
  position: relative;
  z-index: 20;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 3vh;
  gap: 0.3rem;
}

.header__name {
  font-family: 'Cinzel', serif;
  font-size: clamp(1.5rem, 4vw, 3.2rem);
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.12em;
  margin: 0;
  text-shadow:
    0 0 40px #040F2D,
    0 0 80px #0f2d63;
  text-transform: uppercase;
}

.header__title {
  font-family: 'Rajdhani', sans-serif;
  font-size: clamp(0.85rem, 1.8vw, 1.3rem);
  font-weight: 300;
  color: rgba(255, 255, 255, 0.849);
  letter-spacing: 0.3em;
  margin: 0;
  text-transform: uppercase;
  /* -webkit-text-stroke: 0.2px white; */
}

.scene-container {
  position: absolute;
  inset: 0;
  z-index: 1;
  /* Fallback while WebGL scene background loads */
  background-color: #050706;
}

/* About Portal Content Styles */
.about-content h2 {
  margin: 0 0 1rem 0;
  font-size: 1.8em;
  color: #c084fc;
  font-weight: 700;
}

.about-content h3 {
  margin: 1.5rem 0 0.8rem 0;
  font-size: 1.3em;
  color: #a070d8;
  font-weight: 600;
}

.about-content p {
  margin: 0.8rem 0;
  font-size: 1em;
  line-height: 1.7;
}

.about-content ul {
  margin: 0.8rem 0;
  list-style-type: none;
}

.about-content ul li {
  margin: 0.5rem 0;
  position: relative;
}

.about-content ul li span {
  padding-left: 12px;
}

.about-content code {
  background: rgba(192, 132, 252, 0.1);
  padding: 0.2em 0.5em;
  border-radius: 3px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
  color: whitesmoke;
}
</style>
