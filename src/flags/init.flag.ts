import type { FlagInfo } from '../models/flag.model.js'

import { Flag } from './flag.js'

export class InitFlag extends Flag {
  flag: FlagInfo = {
    key: 'init',
    short: 'i',
    desc: 'initialize config',
    run: (): Promise<boolean> => this.#init()
  }

  async #init(): Promise<boolean> {
    await this.confService.init()
    return true
  }
}
