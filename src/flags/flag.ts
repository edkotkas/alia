import type { FlagInfo, FlagData } from '../models/flag.model'
import type { ConfigService } from '../services/config.service'
import type { GistService } from '../services/gist.service'

export abstract class Flag {
  abstract flag: FlagInfo

  constructor(protected confService: ConfigService, protected gistService: GistService) {}

  mods: FlagInfo[] = []
  async run(args: string[], data: FlagData): Promise<boolean> {
    for (const [key, value] of Object.entries(data)) {
      const mod = this.mods.find((m) => m.key === key)
      const result = await mod?.run?.(value)
      if (result !== undefined) {
        return result
      }
    }

    const result = await this.flag.run?.(args, data)
    return result ?? true
  }
}
