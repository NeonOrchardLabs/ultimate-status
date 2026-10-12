// Shares the usage numbers with other tools (Weft) through a small JSON file,
// ~/.claude/ultimate-status/usage.json, version 1. No tokens or secrets.
type Limit = { kind: string; percentUsed: number; resetsAt?: string }
type Ctx = { percent?: number }

export const SHARE_INTERVAL_MS = 5000

const rfc3339 = (v: string | number | undefined): string | null => {
  if (v === undefined || v === '') return null
  const ms = typeof v === 'number' ? (v < 1e12 ? v * 1000 : v) : Date.parse(v)
  return Number.isFinite(ms) ? new Date(ms).toISOString() : null
}

export function usagePayload(
  now: number,
  sessionId: string | null,
  cwd: string | null,
  model: string | null,
  ctx: Ctx,
  limits: readonly Limit[],
) {
  const win = (kind: string) => {
    const l = limits.find(x => x.kind === kind)
    return { used_percent: l ? l.percentUsed : null, resets_at: rfc3339(l?.resetsAt) }
  }
  return {
    version: 1,
    updated_at: new Date(now).toISOString(),
    session_id: sessionId,
    cwd,
    five_hour: win('five_hour'),
    seven_day: win('seven_day'),
    context: { percent: typeof ctx.percent === 'number' ? ctx.percent : null },
    model,
  }
}

let lastAt = 0
let lastKey = ''

// Whether a write is due: values changed and 5 seconds passed since the last write.
export function due(now: number, key: string): boolean {
  return key !== lastKey && now - lastAt >= SHARE_INTERVAL_MS
}
export function resetShare() {
  lastAt = 0
  lastKey = ''
}

// Claims the write slot when one is due; returns the key to restore on failure.
export function claim(now: number, key: string): { prevAt: number; prevKey: string } | null {
  if (!due(now, key)) return null
  const prev = { prevAt: lastAt, prevKey: lastKey }
  lastAt = now
  lastKey = key
  return prev
}
export function release(prev: { prevAt: number; prevKey: string }) {
  lastAt = prev.prevAt
  lastKey = prev.prevKey
}
export const usageKey = (p: ReturnType<typeof usagePayload>) => JSON.stringify([p.five_hour, p.seven_day, p.context])
