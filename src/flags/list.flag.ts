import type { Alias } from '../models/config.model.js'
import type { FlagInfo } from '../models/flag.model.js'

import logger from '../utils/logger.js'
import { Flag } from './flag.js'

export class ListFlag extends Flag {
  readonly #alias: Alias = this.confService.alias

  #aliaKeys: string[] = this.confService.keys
  #jsonFormat = false

  flag: FlagInfo = {
    key: 'list',
    short: 'l',
    desc: 'list available alias',
    run: () => this.#list()
  }

  mods: FlagInfo[] = [
    {
      key: 'sort',
      short: 's',
      desc: 'sort alphabetically',
      run: () => this.#sort()
    },
    {
      key: 'json',
      short: 'j',
      desc: 'list alias info as json',
      run: () => this.#json()
    },
    {
      key: 'filter',
      short: 'f',
      desc: 'filter alias list',
      run: (args: string[]) => this.#filter(args)
    }
  ]

  #sort(): boolean {
    this.#aliaKeys = this.#aliaKeys.sort()

    return true
  }

  #json(): boolean {
    this.#jsonFormat = true

    return true
  }

  #filter(data: string[]): boolean {
    this.#aliaKeys = this.#aliaKeys.filter((a) => data.includes(a))

    return true
  }

  #list(): boolean {
    if (this.#jsonFormat) {
      const alias = this.#aliaKeys.reduce<Alias>((acc, val) => {
        acc[val] = this.#alias[val]
        return acc
      }, {})
      logger.info(JSON.stringify(alias, null, 2))

      return true
    }

    const list = this.#aliaKeys.map((key) => `${key} \t=> \t${this.#alias[key].command.join(' ')}`).join('\n')

    logger.info(list)

    return true
  }
}
