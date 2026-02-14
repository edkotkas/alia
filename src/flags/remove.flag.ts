import type { FlagData, FlagInfo } from '../models/flag.model.js'
import logger from '../utils/logger.js'
import { Flag } from './flag.js'

export class RemoveFlag extends Flag {
  #project = false

  flag: FlagInfo = {
    key: 'remove',
    short: 'r',
    desc: 'remove an alias',
    run: (args: string[], data?: FlagData) => this.#remove(args, data)
  }

  mods: FlagInfo[] = [
    {
      key: 'project',
      short: 'p',
      desc: 'remove alias from current project',
      run: () => this.#setProject()
    }
  ]

  #setProject(): boolean {
    // TODO: update mods to handle consumption of args instead of returning a boolean
    this.#project = true

    return true
  }

  #remove(args: string[], data?: FlagData): boolean {
    let key: string | undefined = args[0]
    if (this.#project) {
      key = data?.project[0]
    }

    if (!key) {
      logger.info('missing alias key')
      return true
    }

    const alias = this.confService.getAlias(key)
    if (!alias) {
      logger.info(`alias '${key}' does not exist`)
      return true
    }

    this.confService.removeAlias(key, this.#project)
    logger.info(`removed alias: ${key}`)

    return true
  }
}
