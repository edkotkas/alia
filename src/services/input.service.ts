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

    const params: ActionParameters = { args, data: {}, modifiers: {} }

    params.modifiers = flag.modifiers?.reduce<FlagModifiers>((acc, modifier) => {
      const simple = typeof modifier === 'string'
      const key = simple ? modifier : modifier.key
      const modRegex = new RegExp(`^--(${key})=?(.+)?`)
      const param = args.find(a => modRegex.test(a))

      if (!param) {
        return acc
      }

      acc[key] = param

      const result = simple 
        ? modRegex.exec(param) 
        : args.filter(a => modifier.format.test(a))

      if (!result) {
        return acc
      }
      
      params.data[key] = simple 
        ? result[2] 
        : result

      return acc
    }, {}) ?? {}

    await flag.action(params)

    return true
  }
}
