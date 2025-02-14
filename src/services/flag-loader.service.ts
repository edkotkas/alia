import type { Flag, FlagModule } from '../flags/flag'
import type { ConfigService } from './config.service'
import type { GistService } from './gist.service'

import fs from 'fs/promises'
import path from 'node:path'

export class FlagLoaderService {
  private flagsDir = path.join(import.meta.dirname, '..', 'flags')

  public async loadFlags(confService: ConfigService, gistService: GistService): Promise<Flag[]> {
    const flagPaths = await this.getFlags()
    return Promise.all(flagPaths.map((f) => this.loadFlag(f, confService, gistService)))
  }

  private async getFlags(): Promise<string[]> {
    const flags = await fs.readdir(this.flagsDir)
    return flags.filter((f) => /\.flag\.[jt]s/i.exec(f))
  }

  private async loadFlag(flag: string, confService: ConfigService, gistService: GistService): Promise<Flag> {
    /* c8 ignore next */ // Coverage picks up "as FlagModule" as uncovered branch
    const module = (await import(`../flags/${flag}`)) as FlagModule
    const defaultKey = Object.keys(module)[0]
    const flagClass = module[defaultKey]

    return new flagClass(confService, gistService)
  }
}
