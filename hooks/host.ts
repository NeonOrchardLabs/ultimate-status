// Weft can draw this bar in its own footer ("Adopt Ultimate-Status"). When it
// does, the bar stays out of Claude Code so it isn't drawn twice; the shared
// files (usage.json and the rest) are still written.
export const HOST_CHECK_MS = 3000

export type HostInput = {
  termProgram?: string
  flag?: string
  // Text of host-adopted.json, or undefined when the file is absent.
  fileText?: string
  pidAlive: (pid: number) => boolean | Promise<boolean>
}

export async function weftAdopted(i: HostInput): Promise<boolean> {
  if (i.termProgram !== 'WeftTerminal') return false
  if (i.flag === '1') return true
  if (i.fileText === undefined) return false
  try {
    const v = JSON.parse(i.fileText)
    if (!v || v.host !== 'weft' || v.adopted !== true) return false
    if (!Number.isInteger(v.pid) || v.pid <= 0) return false
    return await i.pidAlive(v.pid)
  } catch {
    return false
  }
}
