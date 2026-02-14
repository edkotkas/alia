import fs from 'node:fs'

import { clearProviders, inject } from '../utils/di.js'
import { file } from '../utils/file.js'
import { FlagLoaderService } from './flag-loader.service.js'

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

describe('FlagLoaderService', () => {
  let flagLoaderService: FlagLoaderService
  const helpSnap = fs.readFileSync('snapshots/help', 'utf-8')

  beforeEach(() => {
    flagLoaderService = inject(FlagLoaderService)
    spyOn(file, 'read').and.callFake(() => JSON.stringify({ alias: { test: { cmd: 'echo test' } }, options: {} }))
  })

  afterEach(() => {
    clearProviders()
  })

  it('should load flags', async () => {
    const flags = await flagLoaderService.loadFlags()
    expect(flags.length).toBeGreaterThan(0)
  })

  it('should have flag matching snapshot', async () => {
    const flags = await flagLoaderService.loadFlags()

    for (const flag of flags) {
      const escapedDesc = escapeRegExp(flag.flag.desc)
      const helpDesc = new RegExp(`--${flag.flag.key},\\s-${flag.flag.short}\\s+${escapedDesc}\n`)
      expect(helpDesc.test(helpSnap)).toBeTrue()

      if (flag.mods.length > 0) {
        for (const mod of flag.mods) {
          const escapedMod = escapeRegExp(mod.desc)
          const modDesc = new RegExp(`\\s+--${mod.key},\\s+-${mod.short}\\s+${escapedMod}(\\s+\\(required\\))*\n`)
          if (!modDesc.test(helpSnap)) console.log('mod', modDesc)

          expect(modDesc.test(helpSnap)).toBeTrue()
        }
      }
    }
  })
})
