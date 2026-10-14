import { describe, expect, test } from 'claude-code/testing'
import { weftAdopted } from './host'

const file = JSON.stringify({ host: 'weft', adopted: true, pid: 42 })
const base = { termProgram: 'WeftTerminal', pidAlive: (p: number) => p === 42 }

describe('weft adoption', () => {
  test('outside Weft the bar always draws', async () => {
    expect(await weftAdopted({ ...base, termProgram: 'Apple_Terminal', flag: '1', fileText: file })).toBe(false)
    expect(await weftAdopted({ ...base, termProgram: undefined, flag: '1' })).toBe(false)
  })

  test('the env flag adopts', async () => {
    expect(await weftAdopted({ ...base, flag: '1' })).toBe(true)
    expect(await weftAdopted({ ...base, flag: '0' })).toBe(false)
  })

  test('a file with a live pid adopts', async () => {
    expect(await weftAdopted({ ...base, fileText: file })).toBe(true)
  })

  test('no file, a malformed file, or wrong fields do not adopt', async () => {
    expect(await weftAdopted({ ...base })).toBe(false)
    expect(await weftAdopted({ ...base, fileText: '{nope' })).toBe(false)
    expect(await weftAdopted({ ...base, fileText: 'null' })).toBe(false)
    expect(await weftAdopted({ ...base, fileText: JSON.stringify({ host: 'weft', adopted: false, pid: 42 }) })).toBe(false)
    expect(await weftAdopted({ ...base, fileText: JSON.stringify({ host: 'other', adopted: true, pid: 42 }) })).toBe(false)
    expect(await weftAdopted({ ...base, fileText: JSON.stringify({ host: 'weft', adopted: true }) })).toBe(false)
  })

  test('a dead pid does not adopt', async () => {
    expect(await weftAdopted({ ...base, fileText: JSON.stringify({ host: 'weft', adopted: true, pid: 7 }) })).toBe(false)
  })
})
