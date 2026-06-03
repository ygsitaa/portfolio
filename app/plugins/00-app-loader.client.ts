import { buildDefaultPreloadTasks } from '~/utils/preload/buildDefaultTasks'
import { runPreloadPipeline } from '~/utils/preload/pipeline'

export default defineNuxtPlugin({
  name: 'app-loader',
  enforce: 'pre',
  parallel: true,
  setup() {
    const loader = useAppLoader()
    loader.start()

    const tasks = buildDefaultPreloadTasks()

    runPreloadPipeline(tasks, {
      onProgress: (percent) => loader.setTargetProgress(percent),
      onTaskError: (taskId, error) => loader.recordFailure(taskId, error),
    }, {
      globalTimeoutMs: 12000,
      onGlobalTimeout: () => loader.forceComplete('timeout'),
    }).then(async () => {
      if (loader.phase.value !== 'loading') return
      await loader.waitForGates()
      if (loader.phase.value !== 'loading') return
      loader.complete()
    }).catch(console.error)
  },
})
