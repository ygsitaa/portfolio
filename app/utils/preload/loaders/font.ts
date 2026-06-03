import type { PreloadTask } from '../types'

export function createFontPreloadTask(
  id: string,
  families: readonly string[],
  weight: number,
  options: { critical?: boolean; timeoutMs?: number } = {},
): PreloadTask {
  return {
    id,
    weight,
    critical: options.critical ?? true,
    timeoutMs: options.timeoutMs,
    run: (onProgress) => preloadFonts(families, onProgress),
  }
}

async function preloadFonts(
  families: readonly string[],
  onProgress: (ratio: number) => void,
): Promise<void> {
  onProgress(0)

  if (typeof document === 'undefined' || !document.fonts) {
    onProgress(1)
    return
  }

  const specs = families.flatMap((family) => [
    `400 1em "${family}"`,
    `600 1em "${family}"`,
    `700 1em "${family}"`,
  ])

  const total = specs.length
  let done = 0

  await Promise.allSettled(
    specs.map(async (spec) => {
      try {
        await document.fonts.load(spec)
      } catch {
        // individual font load may fail; continue
      }
      done += 1
      onProgress(done / total)
    }),
  )

  try {
    await document.fonts.ready
  } catch {
    // ignore
  }

  onProgress(1)
}
