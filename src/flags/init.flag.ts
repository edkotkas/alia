import type { FlagInfo } from '../models/flag.model.js'

import { Flag } from './flag.js'

export class InitFlag extends Flag {
  flag: FlagInfo = {
    key: 'init',
    short: 'i',
    desc: 'initialize config',
    run: (): Promise<undefined> => this.init(),
    noConf: true
  }

  private async init(): Promise<undefined> {
    await this.confService.init()
  }
}
