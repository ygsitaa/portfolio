import type { PreloadTask } from '../types'

export function createImagePreloadTask(
  id: string,
  url: string,
  weight: number,
  options: { critical?: boolean; timeoutMs?: number } = {},
): PreloadTask {
  return {
    id,
    weight,
    critical: options.critical ?? true,
    timeoutMs: options.timeoutMs,
    run: (onProgress) => preloadImage(url, onProgress),
  }
}

function preloadImage(
  url: string,
  onProgress: (ratio: number) => void,
): Promise<void> {
  return new Promise((resolve) => {
    onProgress(0)
    const img = new Image()

    const finish = () => {
      onProgress(1)
      resolve()
    }

    img.onload = async () => {
      try {
        if (typeof img.decode === 'function') {
          await img.decode()
        }
      } catch {
        // decode failed but image loaded — still count as done
      }
      finish()
    }

    img.onerror = () => {
      finish()
    }

    img.src = url
  })
}
