import { CommandService } from './command.service.js'
import { FlagService } from './flag.service.js'

import { inject } from '../utils/di.js'
import logger from '../utils/logger.js'
import { ConfigService } from './config.service.js'

export class InputService {
  readonly #flagService: FlagService = inject(FlagService)
  readonly #commandService: CommandService = inject(CommandService)
  readonly #configService = inject(ConfigService)

  async read(): Promise<void> {
    try {
      await this.#configService.init(true)

      const argv = process.argv.slice(2)
      const flag = await this.#flagService.run(argv)
      if (!flag) {
        this.#commandService.run(argv)
      }
    } catch (error) {
      logger.error(error as Error)
    }
  }
}
