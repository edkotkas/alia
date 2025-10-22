import type { FlagInfo, FlagData } from '../models/flag.model.js'
import { ConfigService } from '../services/config.service.js'
import { GistService } from '../services/gist.service.js'
import { inject } from '../utils/di.js'

export type FlagConstructor = new () => Flag
export type FlagModule = Record<string, FlagConstructor>

export class Flag {
  readonly confService: ConfigService = inject(ConfigService)
  readonly gistService: GistService = inject(GistService)

  flag!: FlagInfo

  mods: FlagInfo[] = []

  async run(args: string[], data: FlagData): Promise<boolean> {
    const mods = this.mods.filter((m) => Object.keys(data).includes(m.key))
    for (const mod of mods) {
      const value = data[mod.key]
      const result = await mod.run?.(value)
      if (result === false) {
        return false
      }
    }

    const result = await this.flag.run?.(args, data)
    if (result === undefined) {
      return true
    }

    return result
  }
}
