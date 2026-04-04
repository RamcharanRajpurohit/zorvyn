import { env } from '../config/env'

type LogLevel = 'info' | 'warn' | 'error'

type LogMeta = Record<string, unknown>

const ANSI = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
} as const

function colorize(text: string, color: string) {
  return `${color}${text}${ANSI.reset}`
}

function formatMeta(meta: LogMeta) {
  return Object.entries(meta)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key}="${value}"`
      }

      return `${key}=${JSON.stringify(value)}`
    })
    .join(' ')
}

function write(level: LogLevel, message: string, meta: LogMeta = {}) {
  const timestamp = new Date().toISOString()

  if (env.NODE_ENV === 'production') {
    const payload = {
      timestamp,
      level,
      message,
      ...meta,
    }

    console[level === 'error' ? 'error' : 'log'](JSON.stringify(payload))
    return
  }

  const metaText = formatMeta(meta)
  const levelLabel =
    level === 'error'
      ? colorize(level.toUpperCase(), ANSI.red)
      : level === 'warn'
        ? colorize(level.toUpperCase(), ANSI.yellow)
        : colorize(level.toUpperCase(), ANSI.blue)
  const line = `${colorize(`[${timestamp}]`, ANSI.dim)} ${levelLabel} ${message}${metaText ? ` ${metaText}` : ''}`

  console[level === 'error' ? 'error' : 'log'](line)
}

export const logger = {
  info(message: string, meta?: LogMeta) {
    write('info', message, meta)
  },
  warn(message: string, meta?: LogMeta) {
    write('warn', message, meta)
  },
  error(message: string, meta?: LogMeta) {
    write('error', message, meta)
  },
}
