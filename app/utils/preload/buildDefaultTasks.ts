import {
  FONT_AWESOME_HREF,
  getCriticalImageUrls,
  GOOGLE_FONT_FAMILIES,
} from '~/config/criticalAssets'
import type { PreloadTask } from './types'
import { createImagePreloadTask } from './loaders/image'
import { createFontPreloadTask } from './loaders/font'
import { createStylesheetPreloadTask } from './loaders/stylesheet'
import { createPromisePreloadTask } from './loaders/promise'

/** Pipeline tasks for initial load (weights sum to 90; WebGL gate adds 10 via composable). */
export function buildDefaultPreloadTasks(): PreloadTask[] {
  const imageUrls = getCriticalImageUrls()
  const imageWeightTotal = 50
  const perImageWeight = imageWeightTotal / imageUrls.length

  const imageTasks: PreloadTask[] = imageUrls.map((url, index) =>
    createImagePreloadTask(`image-${index}`, url, perImageWeight, {
      critical: true,
      timeoutMs: 8000,
    }),
  )

  return [
    ...imageTasks,
    createFontPreloadTask('google-fonts', GOOGLE_FONT_FAMILIES, 15, {
      critical: true,
      timeoutMs: 8000,
    }),
    createStylesheetPreloadTask('font-awesome', FONT_AWESOME_HREF, 5, {
      critical: false,
      timeoutMs: 5000,
    }),
    createPromisePreloadTask(
      'nuxt-ready',
      10,
      () =>
        new Promise<void>((resolve) => {
          onNuxtReady(() => resolve())
        }),
      { critical: true, timeoutMs: 10000 },
    ),
    createPromisePreloadTask(
      'preload-components',
      10,
      async () => {
        await preloadComponents(['OrbitalRing', 'OrbitalHUD'])
      },
      { critical: true, timeoutMs: 10000 },
    ),
  ]
}
