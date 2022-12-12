import type { ActionParameters, FlagModifiers } from '../models'
import type { OptionService, CommandService } from './index.js'

export class InputService {

  constructor(
    private optionService: OptionService,
    private commandService: CommandService
  ) {
  }

  public async read(): Promise<void> {
    const argv: string[] = process.argv.slice(2)

    if (argv.length === 0) {
      return this.optionService.help()
    }

    await this.processFlags(argv) || this.commandService.run(argv)
  }

  private async processFlags([arg, ...args]: string[]): Promise<boolean> {
    const dashes = arg.match(/^-{1,2}/)
    if (!dashes) {
      return false
    }

    const flags = this.optionService.flags
    const flagType = dashes[0].length === 2 ? 'full' : 'short'
    const key = arg.replace(dashes[0], '')
    const flag = flags.find(f => f[flagType] === key)

    if (!flag) {
      throw new Error(`Invalid flag provided: ${arg}`)
    }

    const params: ActionParameters<FlagModifiers> = { args, data: {}, modifiers: {} }

    if (flag.modifiers) {
      params.modifiers = flag.modifiers.reduce<FlagModifiers>((acc, key) => {
        const modRegex = new RegExp(`^--(${key})=?(.+)?`)
        const param = args.find(a => modRegex.test(a))

        if (param) {
          const result = modRegex.exec(param)
          if (result) {
            params.data[key] = result[2]
          }

          acc[key] = param
        }

        return acc
      }, {})
    }

    await flag.action(params)

    return true
  }
}
