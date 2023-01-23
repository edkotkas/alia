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
    const key = arg.replace(dashes[0], '')
    const flag = flags.find(f => f.key === key || f.short === key)

    if (!flag) {
      throw new Error(`Invalid flag provided: ${arg}`)
    }

    const params: ActionParameters = { args, data: {}, modifiers: {} }

    params.modifiers = flag.modifiers?.reduce<FlagModifiers>((acc, { key, format }) => {
      const modRegex = new RegExp(`^--(?:${key})=?(.+)?`)
      const param = args.find(a => modRegex.test(a))

      if (!param) {
        return acc
      }

      acc[key] = param

      const result = !format
        ? modRegex.exec(param)?.at(1)
        : args.filter(a => format.test(a))

      if (result) {
        params.data = {
          ...params.data,
          [key]: result
        }
      }

      return acc
    }, {}) ?? {}

    await flag.action(params)

    return true
  }
}
