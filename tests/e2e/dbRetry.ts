const SQLITE_BUSY_PATTERNS = ['SQLITE_BUSY', 'database is locked']

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

const isSqliteBusyError = (error: unknown): boolean => {
  const message =
    error && typeof error === 'object' && 'message' in error ? String(error.message) : String(error)

  return SQLITE_BUSY_PATTERNS.some((pattern) => message.includes(pattern))
}

type RetryOptions = {
  maxAttempts?: number
  initialDelayMs?: number
  maxDelayMs?: number
}

export const withSqliteBusyRetry = async <T>(
  operation: () => Promise<T>,
  label: string,
  options: RetryOptions = {},
): Promise<T> => {
  const maxAttempts = options.maxAttempts ?? 8
  const initialDelayMs = options.initialDelayMs ?? 75
  const maxDelayMs = options.maxDelayMs ?? 1500

  let attempt = 1
  let delayMs = initialDelayMs
  let lastError: unknown

  while (attempt <= maxAttempts) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      if (!isSqliteBusyError(error) || attempt === maxAttempts) {
        throw error
      }

      // Keep retries deterministic to make failures reproducible in CI.
      console.warn(`[e2e][db-retry] ${label}: SQLITE_BUSY on attempt ${attempt}, retry in ${delayMs}ms`)
      await sleep(delayMs)
      delayMs = Math.min(maxDelayMs, Math.floor(delayMs * 2))
      attempt += 1
    }
  }

  throw lastError
}

