import logger from '../utils/logger.js'
import type { FlagInfo } from '../models/flag.model.js'
import { Flag } from './flag.js'

export class RemoveFlag extends Flag {
  flag: FlagInfo = {
    key: 'remove',
    short: 'r',
    desc: 'remove an alias',
    run: (args: string[]) => this.#remove(args)
  }

  #remove(data: string[]): boolean {
    const alias = this.confService.getAlias(data[0])
    if (!alias) {
      logger.info(`alias '${data[0]}' does not exist`)
      return true
    }

    this.confService.removeAlias(data[0])
    logger.info(`removed alias: ${data[0]}`)

    return true
  }
}
