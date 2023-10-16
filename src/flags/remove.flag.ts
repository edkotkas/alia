import logger from '../logger.js'
import { Flag } from './flag.js'

export class RemoveFlag extends Flag {
  flag = {
    key: 'remove',
    short: 'r',
    desc: 'remove an alias',
    run: (args: string[]): undefined => this.remove(args)
  }

  private remove(data: string[]): undefined {
    const alias = this.confService.getAlias(data[0])
    if (!alias) {
      logger.info(`Alias '${data[0]}' does not exist`)
      return
    }

    this.confService.removeAlias(data[0])
    logger.info(`Removed alias: ${data[0]}`)
  }
}
