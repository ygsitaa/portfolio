export interface PreloadTask {
  id: string
  weight: number
  critical?: boolean
  timeoutMs?: number
  run: (onProgress: (ratio: number) => void) => Promise<void>
}

export interface PreloadTaskResult {
  id: string
  status: 'fulfilled' | 'rejected'
  error?: unknown
}

export interface PreloadPipelineHooks {
  onProgress: (percent: number) => void
  onTaskError?: (taskId: string, error: unknown) => void
}

export interface PreloadPipelineOptions {
  globalTimeoutMs?: number
  defaultTaskTimeoutMs?: number
  onGlobalTimeout?: () => void
}
