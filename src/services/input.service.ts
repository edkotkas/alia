import { CommandService } from './command.service.js'
import { FlagService } from './flag.service.js'

import logger from '../utils/logger.js'
import { inject } from '../utils/di.js'

export class InputService {
  readonly #flagService: FlagService = inject(FlagService)
  readonly #commandService: CommandService = inject(CommandService)

  public async read(): Promise<void> {
    try {
      const argv: string[] = process.argv.slice(2)
      const flag = await this.#flagService.run(argv)
      if (!flag) {
        this.#commandService.run(argv)
      }
    } catch (error) {
      logger.error(error as Error)
    }
  }
}
