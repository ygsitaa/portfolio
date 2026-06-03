import { orbitalItemsBase } from '~/data/orbitalItems'

export const SCENE_BACKGROUND = '/images/bg2.png'

export const GOOGLE_FONT_FAMILIES = ['Cinzel', 'Rajdhani'] as const

export const FONT_AWESOME_HREF =
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css'

/** Critical images for preload pipeline (deduplicated). */
export function getCriticalImageUrls(): string[] {
  const itemImages = orbitalItemsBase.map((item) => `/images/${item.id}.jpg`)
  return [SCENE_BACKGROUND, ...new Set(itemImages)]
}
