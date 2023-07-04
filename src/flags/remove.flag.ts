import type { ActionParameters, Flag } from '../models'
import type { ConfigService } from '../services'
import Log from '../logger.js'

export const RemoveFlag = {
  key: 'remove',
  short: 'r',
  description: 'remove an alias',
  action: function remove({ args: [key] }: ActionParameters, configService: ConfigService): void {
    if (!configService.getAlias(key)) {
      throw new Error(`Alias '${key}' does not exist`)
    }

    configService.removeAlias(key)
    Log.info(`Removed alias: ${key}`)
  }
} as Flag
