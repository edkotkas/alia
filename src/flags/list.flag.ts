import type { Alias } from '../models/config.model.js'
import type { FlagInfo } from '../models/flag.model.js'

import logger from '../utils/logger.js'
import { Flag } from './flag.js'

export class ListFlag extends Flag {
  private alias: Alias = this.confService.alias
  private aliaKeys: string[] = this.confService.keys
  private jsonFormat = false

  flag: FlagInfo = {
    key: 'list',
    short: 'l',
    desc: 'list available alias',
    run: () => this.list()
  }

  mods: FlagInfo[] = [
    {
      key: 'sort',
      short: 's',
      desc: 'sort alphabetically',
      run: () => this.sort()
    },
    {
      key: 'json',
      short: 'j',
      desc: 'list alias info as json',
      run: () => this.json()
    },
    {
      key: 'filter',
      short: 'f',
      desc: 'filter alias list',
      run: (args: string[]) => this.filter(args)
    }
  ]

  private sort(): boolean {
    this.aliaKeys = this.aliaKeys.sort()

    return true
  }

  private json(): boolean {
    this.jsonFormat = true

    return true
  }

  private filter(data: string[]): boolean {
    this.aliaKeys = this.aliaKeys.filter((a) => data.includes(a))

    return true
  }

  private list(): boolean {
    if (this.jsonFormat) {
      const alias = this.aliaKeys.reduce<Alias>((acc, val) => {
        acc[val] = this.alias[val]
        return acc
      }, {})
      logger.info(JSON.stringify(alias, null, 2))

      return true
    }

    const list = this.aliaKeys
      .map((key) => `${key} \t${this.confService.separator} \t${this.alias[key].command.join(' ')}`)
      .join('\n')

    logger.info(list)

    return true
  }
}
