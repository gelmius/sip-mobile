/**
 * Production-safe Logger
 *
 * Wraps console methods to be disabled in production builds.
 * Uses __DEV__ which is true in development, false in production.
 */

type LogLevel = "log" | "info" | "warn" | "error" | "debug"

interface Logger {
  log: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
  debug: (...args: unknown[]) => void
}

function createLogger(): Logger {
  const isDev = typeof __DEV__ !== "undefined" ? __DEV__ : process.env.NODE_ENV !== "production"

  const noop = () => {}

  const createMethod = (level: LogLevel) => {
    if (!isDev && level !== "error") {
      // In production, only allow errors (for crash reporting)
      return noop
    }

    return (...args: unknown[]) => {
      const timestamp = new Date().toISOString().slice(11, 23)
      const prefix = `[${timestamp}]`

      switch (level) {
        case "log":
          console.log(prefix, ...args)
          break
        case "info":
          console.info(prefix, "ℹ️", ...args)
          break
        case "warn":
          console.warn(prefix, "⚠️", ...args)
          break
        case "error":
          console.error(prefix, "❌", ...args)
          break
        case "debug":
          console.debug(prefix, "🔍", ...args)
          break
      }
    }
  }

  return {
    log: createMethod("log"),
    info: createMethod("info"),
    warn: createMethod("warn"),
    error: createMethod("error"),
    debug: createMethod("debug"),
  }
}

export const logger = createLogger()

// Named exports for convenience
export const { log, info, warn, error, debug } = logger
