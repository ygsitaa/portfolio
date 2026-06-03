import { computed, readonly } from 'vue'

export type AppLoaderPhase =
  | 'idle'
  | 'loading'
  | 'exiting'
  | 'ready'
  | 'forced'

const WEBGL_GATE_ID = 'webgl-scene'
const WEBGL_GATE_WEIGHT = 10
const PIPELINE_MAX_PROGRESS = 90
const MIN_VISIBLE_MS = 400
const STALL_CONTINUE_MS = 10000

interface RegisteredGate {
  id: string
  weight: number
  promise: Promise<void>
  resolved: boolean
}

let rafId: number | null = null
let minVisibleTimer: ReturnType<typeof setTimeout> | null = null
let stallTimer: ReturnType<typeof setTimeout> | null = null
let hasStarted = false
let pendingComplete = false
let gates = new Map<string, RegisteredGate>()

export function useAppLoader() {
  const phase = useState<AppLoaderPhase>('app-loader-phase', () => 'loading')
  const targetProgress = useState<number>('app-loader-target', () => 0)
  const displayProgress = useState<number>('app-loader-display', () => 0)
  const failedTasks = useState<string[]>('app-loader-failures', () => [])
  const showContinue = useState<boolean>('app-loader-show-continue', () => false)
  const statusMessage = useState<string>(
    'app-loader-status',
    () => 'Loading assets',
  )

  const isBlocking = computed(
    () => phase.value === 'loading' || phase.value === 'exiting',
  )

  const isVisible = computed(() => phase.value !== 'ready')

  function setTargetProgress(percent: number) {
    const capped = Math.min(PIPELINE_MAX_PROGRESS, Math.max(0, percent))
    if (capped > targetProgress.value) {
      targetProgress.value = capped
    }
    updateStatusMessage()
  }

  function updateStatusMessage() {
    if (targetProgress.value < 50) {
      statusMessage.value = 'Loading assets'
    } else if (targetProgress.value < PIPELINE_MAX_PROGRESS) {
      statusMessage.value = 'Preparing experience'
    } else {
      statusMessage.value = 'Preparing scene'
    }
  }

  function recordFailure(taskId: string, _error: unknown) {
    if (!failedTasks.value.includes(taskId)) {
      failedTasks.value = [...failedTasks.value, taskId]
    }
  }

  function registerGate(
    id: string,
    promise: Promise<void>,
    weight = WEBGL_GATE_WEIGHT,
  ) {
    const wrapped = promise
      .then(() => {
        const gate = gates.get(id)
        if (gate) gate.resolved = true
        updateGateProgress()
      })
      .catch(() => {
        const gate = gates.get(id)
        if (gate) gate.resolved = true
        updateGateProgress()
      })

    gates.set(id, {
      id,
      weight,
      promise: wrapped,
      resolved: false,
    })
  }

  /** Register a gate that a component resolves when ready (e.g. WebGL scene). */
  function registerResolvableGate(id: string, weight = WEBGL_GATE_WEIGHT) {
    let resolveGate!: () => void
    const promise = new Promise<void>((resolve) => {
      resolveGate = resolve
    })
    registerGate(id, promise, weight)
    return () => resolveGate()
  }

  function updateGateProgress() {
    let gateWeight = 0
    let gateDone = 0
    for (const gate of gates.values()) {
      gateWeight += gate.weight
      if (gate.resolved) gateDone += gate.weight
    }
    if (gateWeight <= 0) return

    const gatePercent = (gateDone / gateWeight) * WEBGL_GATE_WEIGHT
    const pipelinePercent = Math.min(PIPELINE_MAX_PROGRESS, targetProgress.value)
    const combined = Math.min(100, pipelinePercent + gatePercent)
    targetProgress.value = combined
    updateStatusMessage()
  }

  async function waitForGateRegistration(
    id: string,
    maxWaitMs = 15000,
  ): Promise<boolean> {
    const start = Date.now()
    while (!gates.has(id) && Date.now() - start < maxWaitMs) {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
    return gates.has(id)
  }

  async function waitForGates(): Promise<void> {
    await waitForGateRegistration(WEBGL_GATE_ID)

    const gatePromises = [...gates.values()].map((g) =>
      Promise.race([
        g.promise,
        new Promise<void>((resolve) => setTimeout(resolve, 8000)),
      ]),
    )

    await Promise.all(gatePromises)
    targetProgress.value = 100
    updateStatusMessage()
  }

  function tick() {
    const delta = targetProgress.value - displayProgress.value
    if (delta > 0) {
      const step = Math.max(0.15, delta * 0.08)
      displayProgress.value = Math.min(
        targetProgress.value,
        displayProgress.value + step,
      )
    }

    if (
      phase.value === 'loading' &&
      pendingComplete &&
      targetProgress.value >= 100 &&
      displayProgress.value >= 99.5
    ) {
      beginExit()
      return
    }

    rafId = requestAnimationFrame(tick)
  }

  function startSmoothing() {
    if (rafId !== null) return
    rafId = requestAnimationFrame(tick)
  }

  function stopSmoothing() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  function revealApp() {
    if (import.meta.client) {
      document.documentElement.classList.remove('app-loading')
      document.documentElement.classList.add('app-ready')
    }
  }

  function beginExit() {
    if (phase.value !== 'loading' && phase.value !== 'forced') return
    phase.value = 'exiting'
    statusMessage.value = 'Ready'
    stopSmoothing()
  }

  function finishReady() {
    phase.value = 'ready'
    revealApp()
    stopSmoothing()
    if (minVisibleTimer) {
      clearTimeout(minVisibleTimer)
      minVisibleTimer = null
    }
    if (stallTimer) {
      clearTimeout(stallTimer)
      stallTimer = null
    }
  }

  function start() {
    if (hasStarted) return
    hasStarted = true

    if (import.meta.client) {
      document.documentElement.classList.add('app-loading')
    }

    phase.value = 'loading'
    startSmoothing()

    stallTimer = setTimeout(() => {
      showContinue.value = true
    }, STALL_CONTINUE_MS)
  }

  function complete() {
    targetProgress.value = 100
    pendingComplete = true

    minVisibleTimer = setTimeout(() => {
      if (phase.value === 'loading' && displayProgress.value >= 99.5) {
        beginExit()
      }
    }, MIN_VISIBLE_MS)
  }

  function forceComplete(_reason?: string) {
    targetProgress.value = 100
    displayProgress.value = 100
    pendingComplete = true
    phase.value = 'forced'
    beginExit()
  }

  function onExitAnimationEnd() {
    finishReady()
  }

  function skip() {
    forceComplete('user-skip')
  }

  function resetForHmr() {
    gates.clear()
    hasStarted = false
    pendingComplete = false
  }

  return {
    phase: readonly(phase),
    targetProgress: readonly(targetProgress),
    displayProgress: readonly(displayProgress),
    failedTasks: readonly(failedTasks),
    showContinue: readonly(showContinue),
    statusMessage: readonly(statusMessage),
    isBlocking,
    isVisible,
    start,
    setTargetProgress,
    recordFailure,
    registerGate,
    registerResolvableGate,
    waitForGates,
    complete,
    forceComplete,
    skip,
    onExitAnimationEnd,
    resetForHmr,
  }
}
