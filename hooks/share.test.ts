import { describe, expect, test } from 'claude-code/testing'
import { DEFAULTS, cleanSettings } from './settings'
import { SHARE_INTERVAL_MS, due, resetShare, usagePayload } from './share'

describe('share usage', () => {
  test('payload has the version 1 shape', () => {
    const p = usagePayload(Date.parse('2026-01-01T00:00:00Z'), 's1', '/x', 'claude-opus-5', { percent: 12 }, [
      { kind: 'five_hour', percentUsed: 30.5, resetsAt: '2026-01-01T03:00:00Z' },
    ])
    expect(p).toEqual({
      version: 1,
      updated_at: '2026-01-01T00:00:00.000Z',
      session_id: 's1',
      cwd: '/x',
      five_hour: { used_percent: 30.5, resets_at: '2026-01-01T03:00:00.000Z' },
      seven_day: { used_percent: null, resets_at: null },
      context: { percent: 12 },
      model: 'claude-opus-5',
    })
  })

  test('epoch resets become RFC3339, missing context is null', () => {
    const p = usagePayload(0, null, null, null, {}, [{ kind: 'seven_day', percentUsed: 1, resetsAt: undefined }])
    expect(p.context.percent).toBeNull()
    expect(p.seven_day.resets_at).toBeNull()
  })

  test('on by default, off when set false', () => {
    expect(DEFAULTS.shareUsage).toBe(true)
    expect(cleanSettings({ shareUsage: false }).shareUsage).toBe(false)
    expect(cleanSettings({}).shareUsage).toBe(true)
  })

  test('writes are due only once per interval', () => {
    resetShare()
    expect(due(10_000, 'a')).toBe(true)
    expect(due(10_000 + SHARE_INTERVAL_MS - 1, 'b')).toBe(true)
  })
})
