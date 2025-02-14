import type { ConfigService } from './config.service'
import type { GistService } from './gist.service'

import fs from 'node:fs'

import { FlagLoaderService } from './flag-loader.service'

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

describe('FlagLoaderService', () => {
  let flagLoaderService: FlagLoaderService
  const helpSnap = fs.readFileSync('snapshots/help', 'utf-8')

  beforeEach(() => {
    flagLoaderService = new FlagLoaderService()
  })

  it('should load flags', async () => {
    const flags = await flagLoaderService.loadFlags({} as ConfigService, {} as GistService)
    expect(flags.length).toBeGreaterThan(0)
  })

  it('should have flag matching snap', async () => {
    const flags = await flagLoaderService.loadFlags({} as ConfigService, {} as GistService)

    for (const flag of flags) {
      const escapedDesc = escapeRegExp(flag.flag.desc)
      const helpDesc = new RegExp(`--${flag.flag.key},\\s-${flag.flag.short}\\s+${escapedDesc}\n`)

      expect(helpDesc.test(helpSnap)).toBeTrue()

      if (flag.mods.length > 0) {
        for (const mod of flag.mods) {
          const escapedMod = escapeRegExp(mod.desc)
          const modDesc = new RegExp(`\\s+--${mod.key},\\s+-${mod.short}\\s+${escapedMod}\n`)

          expect(modDesc.test(helpSnap)).toBeTrue()
        }
      }
    }
  })
})
