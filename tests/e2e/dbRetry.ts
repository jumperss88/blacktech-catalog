const SQLITE_BUSY_PATTERNS = ['SQLITE_BUSY', 'database is locked']

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

const isSqliteBusyError = (error: unknown): boolean => {
  const messages: string[] = []
  let current: unknown = error
  let depth = 0

  while (current && depth < 8) {
    const message =
      current && typeof current === 'object' && 'message' in current
        ? String(current.message)
        : String(current)
    messages.push(message)

    if (current && typeof current === 'object' && 'stack' in current) {
      messages.push(String(current.stack))
    }

    if (current && typeof current === 'object' && 'cause' in current) {
      current = current.cause
      depth += 1
      continue
    }

    break
  }

  return SQLITE_BUSY_PATTERNS.some((pattern) => messages.some((message) => message.includes(pattern)))
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
  const maxAttempts = options.maxAttempts ?? 14
  const initialDelayMs = options.initialDelayMs ?? 100
  const maxDelayMs = options.maxDelayMs ?? 3000

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
