import type { ActionParameters, Flag } from '../models'
import type { ConfigService } from '../services'

export const InitFlag: Flag = {
  key: 'init',
  short: 'i',
  description: 'initialize config',
  action: function init(_: ActionParameters, configService: ConfigService): Promise<void> {
    return configService.init()
  }
}
