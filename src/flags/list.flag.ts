import type { Alias } from '../models/config.model.js'
import type { FlagInfo } from '../models/flag.model.js'

import logger from '../logger.js'
import { Flag } from './flag.js'

export class ListFlag extends Flag {
  private alias = this.confService.config.alias
  private aliaKeys = Object.keys(this.alias)
  private jsonFormat = false

  flag: FlagInfo = {
    key: 'list',
    short: 'l',
    desc: 'list available alias',
    run: (): undefined => this.list()
  }

  mods: FlagInfo[] = [
    {
      key: 'sort',
      short: 's',
      desc: 'sort alphabetically',
      run: (): undefined => this.sort()
    },
    {
      key: 'json',
      short: 'j',
      desc: 'list alias info as json',
      run: (): undefined => this.json()
    },
    {
      key: 'filter',
      short: 'f',
      desc: 'filter alias list',
      run: (args: string[]): undefined => this.filter(args)
    }
  ]

  private sort(): undefined {
    this.aliaKeys = this.aliaKeys.sort()
  }

  private json(): undefined {
    this.jsonFormat = true
  }

  private filter(data: string[]): undefined {
    this.aliaKeys = this.aliaKeys.filter((a) => data.includes(a))
  }

  private list(): undefined {
    if (this.jsonFormat) {
      const alias = this.aliaKeys.reduce<Alias>((acc, val) => {
        acc[val] = this.alias[val]
        return acc
      }, {})
      logger.info(JSON.stringify(alias, null, 2))
      return
    }

    const list = this.aliaKeys
      .map((key) => `${key} \t${this.confService.separator} \t${this.alias[key].command.join(' ')}`)
      .join('\n')

    logger.info(list)
  }
}
