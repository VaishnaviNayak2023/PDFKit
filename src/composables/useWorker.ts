import { ref, onUnmounted } from 'vue'

export function useWorker<T = any, R = any>(
  workerPath: string,
  workerType: string
) {
  const result = ref<R | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)
  let worker: Worker | null = null

  const execute = async (data: T): Promise<R> => {
    loading.value = true
    error.value = null
    result.value = null

    return new Promise((resolve, reject) => {
      try {
        worker = new Worker(new URL(workerPath, import.meta.url), {
          type: 'module'
        })

        worker.onmessage = (event: MessageEvent) => {
          const response = event.data as {
            id: string
            type: string
            success: boolean
            result?: R
            error?: string
          }

          loading.value = false

          if (response.success) {
            result.value = response.result
            resolve(response.result as R)
          } else {
            error.value = response.error
            reject(new Error(response.error))
          }

          worker?.terminate()
          worker = null
        }

        worker.onerror = (err) => {
          loading.value = false
          error.value = 'Worker error occurred'
          reject(err)
          worker?.terminate()
          worker = null
        }

        worker.postMessage({
          type: workerType,
          id: crypto.randomUUID(),
          data
        })
      } catch (err) {
        loading.value = false
        error.value = 'Failed to create worker'
        reject(err)
      }
    })
  }

  onUnmounted(() => {
    worker?.terminate()
  })

  return {
    result,
    error,
    loading,
    execute
  }
}
