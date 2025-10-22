import type { Flag, FlagModule } from '../flags/flag.js'
import { inject } from '../utils/di.js'

import fs from 'fs/promises'
import path from 'node:path'

export class FlagLoaderService {
  readonly #flagsDir = path.join(import.meta.dirname, '..', 'flags')

  async loadFlags(): Promise<Flag[]> {
    const flagPaths = await this.#getFlags()
    return Promise.all(flagPaths.map((f) => this.#loadFlag(f)))
  }

  async #getFlags(): Promise<string[]> {
    const flags = await fs.readdir(this.#flagsDir)
    return flags.filter((f) => /\.flag\.[jt]s/i.exec(f))
  }

  async #loadFlag(flag: string): Promise<Flag> {
    /* c8 ignore next */ // Coverage picks up "as FlagModule" as uncovered branch
    const module = (await import(`../flags/${flag}`)) as FlagModule
    const defaultKey = Object.keys(module)[0]
    const flagClass = module[defaultKey]

    return inject(flagClass)
  }
}
