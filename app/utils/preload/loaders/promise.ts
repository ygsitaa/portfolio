import type { PreloadTask } from '../types'

export function createPromisePreloadTask(
  id: string,
  weight: number,
  promiseFactory: () => Promise<void>,
  options: { critical?: boolean; timeoutMs?: number } = {},
): PreloadTask {
  return {
    id,
    weight,
    critical: options.critical ?? true,
    timeoutMs: options.timeoutMs,
    run: async (onProgress) => {
      onProgress(0)
      await promiseFactory()
      onProgress(1)
    },
  }
}
