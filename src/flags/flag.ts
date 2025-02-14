import type { FlagInfo, FlagData } from '../models/flag.model'
import type { ConfigService } from '../services/config.service'
import type { GistService } from '../services/gist.service'

export type FlagConstructor = new (confService: ConfigService, gistService: GistService) => Flag
export type FlagModule = Record<string, FlagConstructor>

export class Flag {
  flag!: FlagInfo

  constructor(
    protected confService: ConfigService,
    protected gistService: GistService
  ) {}

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
