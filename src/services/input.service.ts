import logger from '../logger'
import type { CommandService } from './command.service'
import type { FlagService } from './flag.service'

export class InputService {
  constructor(
    private flagService: FlagService,
    private commandService: CommandService
  ) {}

  public async read(): Promise<void> {
    try {
      const argv: string[] = process.argv.slice(2)
      const flag = await this.flagService.run(argv)
      if (!flag) {
        this.commandService.run(argv)
      }
    } catch (error) {
      logger.error(error as Error)
    }
  }
}
