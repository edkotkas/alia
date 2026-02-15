import type { Flag } from '../flags/flag.js'
import type { ActionData, FlagInfo } from '../models/flag.model.js'
import { FlagLoaderService } from './flag-loader.service.js'

import { inject } from '../utils/di.js'
import logger from '../utils/logger.js'

export class FlagService {
  readonly #flagLoaderService = inject(FlagLoaderService)

  readonly #dashTypes: Record<string, keyof FlagInfo> = {
    '-': 'short',
    '--': 'key'
  }

  async #getFlags(): Promise<Flag[]> {
    let flags = await this.#flagLoaderService.loadFlags()
    flags = flags.map((f) => {
      if (f.flag.key === 'help') {
        f.run = () => this.#showHelp()
      }

      return f
    })

    return flags
  }

  async run(argv: string[]): Promise<boolean> {
    const [arg] = argv
    let args = argv.slice(1)

    if (!arg) {
      return this.#showHelp()
    }

    const flags = await this.#getFlags()

    const flag = flags.find((f) => this.#dashMatch(f.flag, arg))
    if (!flag) {
      return false
    }

    const dashRegex = /^-{1,2}\w/

    const mods = args.filter((a) => dashRegex.test(a))
    const data: ActionData = {}

    for (const rawMod of mods) {
      const mod = flag.mods.find((f) => this.#dashMatch(f, rawMod))
      if (!mod) {
        logger.info(`unknown flag: ${rawMod}`)
        logger.info('flag usage:')
        this.#flagHelp(flag, '')
        return true
      }

      data[mod.key] ??= []

      const next = args[1]
      const end = mods.includes(next) ? -1 : 1

      const { [0]: _, [end]: value, ...rest } = args

      if (value) {
        data[mod.key].push(value)
      }

      args = Object.values(rest as Record<number, string>)
    }

    const required = flag.mods.filter((m) => m.required)
    const missing = required.filter((r) => !(r.key in data))
    if (missing.length > 0) {
      logger.info(`missing required flag(s): ${missing.map((m) => `--${m.key}`).join(', ')}`)
      logger.info('flag usage:')
      this.#flagHelp(flag, '')
      return true
    }

    const result = await flag.run(args, data)
    if (!result) {
      logger.info('flag usage:')
      this.#flagHelp(flag, '')
    }

    return true
  }

  #dashMatch(flagLike: FlagInfo, value: string): boolean {
    const result = /(-{1,2})((?:\w-?)+)/.exec(value)
    if (!result) {
      return false
    }

    const [_, dashes, rawKey] = result
    const key = this.#dashTypes[dashes]

    return flagLike[key] === rawKey
  }

  async #showHelp(): Promise<boolean> {
    const flags = await this.#getFlags()

    logger.info(`usage: al [options] [alias]`)
    logger.info()
    logger.info('options:')

    flags.forEach((flag) => {
      this.#flagHelp(flag)
    })

    return true
  }

  #flagHelp({ flag, mods }: Flag, pad = '\t'): void {
    const desc = (f: FlagInfo): string => `\t\t${f.desc}${f.required ? ' (required)' : ''}`
    const short = (f: FlagInfo): string => `, -${f.short}`

    logger.info(`${pad}--${flag.key}${short(flag)}${desc(flag)}`)

    mods.forEach((m) => {
      logger.info(`${pad}\t--${m.key}${short(m)}${desc(m)}`)
    })
    logger.info()
  }
}
