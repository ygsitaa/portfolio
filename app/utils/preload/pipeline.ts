import type {
  PreloadPipelineHooks,
  PreloadPipelineOptions,
  PreloadTask,
  PreloadTaskResult,
} from './types'

const DEFAULT_TASK_TIMEOUT_MS = 8000
const DEFAULT_GLOBAL_TIMEOUT_MS = 12000

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  taskId: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Preload task "${taskId}" timed out after ${timeoutMs}ms`))
    }, timeoutMs)

    promise
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch((err) => {
        clearTimeout(timer)
        reject(err)
      })
  })
}

export async function runPreloadPipeline(
  tasks: PreloadTask[],
  hooks: PreloadPipelineHooks,
  options: PreloadPipelineOptions = {},
): Promise<PreloadTaskResult[]> {
  const defaultTaskTimeout =
    options.defaultTaskTimeoutMs ?? DEFAULT_TASK_TIMEOUT_MS
  const globalTimeoutMs = options.globalTimeoutMs ?? DEFAULT_GLOBAL_TIMEOUT_MS

  const totalWeight = tasks.reduce((sum, t) => sum + t.weight, 0)
  const taskProgress = new Map<string, number>()

  const reportAggregate = () => {
    if (totalWeight <= 0) {
      hooks.onProgress(100)
      return
    }
    let weighted = 0
    for (const task of tasks) {
      const ratio = taskProgress.get(task.id) ?? 0
      weighted += task.weight * Math.min(1, Math.max(0, ratio))
    }
    hooks.onProgress(Math.min(100, (weighted / totalWeight) * 100))
  }

  for (const task of tasks) {
    taskProgress.set(task.id, 0)
  }

  let globalTimedOut = false
  const globalTimer = setTimeout(() => {
    globalTimedOut = true
    options.onGlobalTimeout?.()
  }, globalTimeoutMs)

  const runTask = async (task: PreloadTask): Promise<PreloadTaskResult> => {
    const timeoutMs = task.timeoutMs ?? defaultTaskTimeout

    try {
      await withTimeout(
        task.run((ratio) => {
          taskProgress.set(task.id, ratio)
          reportAggregate()
        }),
        timeoutMs,
        task.id,
      )
      taskProgress.set(task.id, 1)
      reportAggregate()
      return { id: task.id, status: 'fulfilled' }
    } catch (error) {
      taskProgress.set(task.id, 1)
      reportAggregate()
      hooks.onTaskError?.(task.id, error)
      if (import.meta.dev) {
        console.warn(`[preload] Task "${task.id}" failed:`, error)
      }
      return { id: task.id, status: 'rejected', error }
    }
  }

  const results = await Promise.all(tasks.map(runTask))

  clearTimeout(globalTimer)

  if (!globalTimedOut) {
    hooks.onProgress(100)
  }

  return results
}
