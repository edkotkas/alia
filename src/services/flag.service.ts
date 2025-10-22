import type { Flag } from '../flags/flag.js'
import type { FlagData, FlagInfo } from '../models/flag.model.js'
import { ConfigService } from './config.service.js'
import { FlagLoaderService } from './flag-loader.service.js'

import logger from '../utils/logger.js'
import { inject } from '../utils/di.js'

export class FlagService {
  readonly #confService = inject(ConfigService)
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
    const [arg, ...args]: string[] = argv

    if (!arg) {
      return this.#showHelp()
    }

    const flags = await this.#getFlags()

    const flag = flags.find((f) => this.#dashMatch(f.flag, arg))
    if (!flag?.flag.noConf && !this.#confService.isReady) {
      logger.init()
      return true
    }

    if (!flag) {
      return false
    }

    const dashRegex = /^-{1,2}\w/

    const cut = flag.flag.key === 'set' ? args.findIndex((a) => a === this.#confService.separator) - 1 : undefined
    let rawData = args.slice(0, cut)

    const mods = rawData.filter((a) => dashRegex.test(a))
    const data: FlagData = {}

    for (const rawMod of mods) {
      const mod = flag.mods.find((f) => this.#dashMatch(f, rawMod))
      if (!mod) {
        logger.info(`unknown flag: ${rawMod}`)
        logger.info('flag usage:')
        this.#flagHelp(flag, '')
        return true
      }

      data[mod.key] ??= []

      const next = rawData[1]
      const end = mods.includes(next) ? -1 : 1

      const { [0]: _, [end]: value, ...rest } = rawData

      if (value) {
        data[mod.key].push(value)
      }

      rawData = Object.values(rest as Record<number, string>)
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

    logger.info(`usage: al [options] [alias] [separator] [command]`)
    logger.info()
    logger.info('options:')

    flags.forEach((flag) => {
      this.#flagHelp(flag)
    })

    return true
  }

  #flagHelp({ flag, mods }: Flag, pad = '\t'): void {
    const desc = (f: FlagInfo): string => `\t\t${f.desc}`
    const short = (f: FlagInfo): string => `, -${f.short}`

    logger.info(`${pad}--${flag.key}${short(flag)}${desc(flag)}`)
    mods.forEach((m) => {
      logger.info(`${pad}\t--${m.key}${short(m)}${desc(m)}`)
    })
    logger.info()
  }
}
