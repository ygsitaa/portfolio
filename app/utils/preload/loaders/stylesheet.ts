import type { PreloadTask } from '../types'

export function createStylesheetPreloadTask(
  id: string,
  href: string,
  weight: number,
  options: { critical?: boolean; timeoutMs?: number } = {},
): PreloadTask {
  return {
    id,
    weight,
    critical: options.critical ?? false,
    timeoutMs: options.timeoutMs ?? 5000,
    run: (onProgress) => preloadStylesheet(href, onProgress),
  }
}

function preloadStylesheet(
  href: string,
  onProgress: (ratio: number) => void,
): Promise<void> {
  return new Promise((resolve) => {
    onProgress(0)

    if (typeof document === 'undefined') {
      onProgress(1)
      resolve()
      return
    }

    const existing = document.querySelector<HTMLLinkElement>(
      `link[rel="stylesheet"][href="${href}"]`,
    )

    if (existing) {
      if (existing.sheet) {
        onProgress(1)
        resolve()
        return
      }
      existing.addEventListener('load', () => {
        onProgress(1)
        resolve()
      })
      existing.addEventListener('error', () => {
        onProgress(1)
        resolve()
      })
      return
    }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.crossOrigin = 'anonymous'

    link.onload = () => {
      onProgress(1)
      resolve()
    }

    link.onerror = () => {
      onProgress(1)
      resolve()
    }

    document.head.appendChild(link)
  })
}
