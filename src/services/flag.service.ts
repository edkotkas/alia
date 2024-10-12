import type { Flag } from '../flags/flag.js'
import type { FlagData, FlagInfo } from '../models/flag.model.js'
import type { ConfigService } from './config.service.js'
import type { GistService } from './gist.service.js'

import { ConfFlag } from '../flags/conf.flag.js'
import { HelpFlag } from '../flags/help.flag.js'
import { InitFlag } from '../flags/init.flag.js'
import { ListFlag } from '../flags/list.flag.js'
import { SetFlag } from '../flags/set.flag.js'
import { SyncFlag } from '../flags/sync.flag.js'
import { RemoveFlag } from '../flags/remove.flag.js'
import { VersionFlag } from '../flags/version.flag.js'
import logger from '../logger.js'

export class FlagService {
  private flags: Flag[]

  private help: Flag

  constructor(
    private confService: ConfigService,
    private gistService: GistService
  ) {
    this.flags = [ConfFlag, InitFlag, ListFlag, RemoveFlag, SetFlag, SyncFlag, VersionFlag].map(
      (f) => new f(confService, gistService)
    )

    this.help = new HelpFlag(this.confService, this.gistService)
    this.help.run = (): Promise<boolean> => this.showHelp()

    this.flags.push(this.help)
  }

  async run(argv: string[]): Promise<boolean> {
    const [arg, ...args]: string[] = argv

    if (!arg) {
      await this.help.run([], {})
      return true
    }

    const flag = this.flags.find((f) => this.dashMatch(f.flag, arg))
    if (!flag?.flag.noConf && !this.confService.isReady) {
      logger.init()
      return true
    }

    if (!flag) {
      return false
    }

    const dashRegex = /^-{1,2}\w/

    const cut = flag.flag.key === 'set' ? args.findIndex((a) => a === this.confService.separator) - 1 : undefined
    let flargs = args.slice(0, cut)

    const mods = flargs.filter((a) => dashRegex.test(a))
    const modData: FlagData = {}

    for (const modArg of mods) {
      const mod = flag.mods.find((f) => this.dashMatch(f, modArg))
      if (!mod) {
        logger.info(`unknown flag: ${modArg}\navailable options:`)
        this.flagHelp(flag, '')
        return true
      }

      modData[mod.key] ??= []

      const start = flargs.findIndex((a) => a === modArg)
      const next = flargs[start + 1]
      const end = mods.includes(next) ? -1 : start + 1

      const { [start]: key, [end]: value, ...rest } = flargs

      if (value) {
        modData[mod.key]?.push(value)
      }

      flargs = Object.values(rest as Record<number, string>)
    }

    return flag.run(args, modData)
  }

  private dashMatch(flagLike: FlagInfo, value: string): boolean {
    const dashes = value.match(/^-{1,2}/)?.at(0)
    if (!dashes) {
      return false
    }

    const v = value.replace(dashes, '')
    const types: Record<string, keyof FlagInfo> = {
      '-': 'short',
      '--': 'key'
    }

    const key = types[dashes]

    return flagLike[key] === v
  }

  private showHelp(): Promise<boolean> {
    logger.info(`
    usage:

      $ al [options] [alias] [separator] [command]

    options:
    `)

    this.flags.forEach((flag) => this.flagHelp(flag))

    const separator = this.confService.separator

    logger.info(`
    examples:

      $ al -s gp ${separator} git push
        > Added: gp ${separator} git push

      $ al gp
        > git push

      $ al -r gp
        > Removed: gp
    `)

    return Promise.resolve(true)
  }

  private flagHelp({ flag, mods }: Flag, pad = '\t'): void {
    const desc = (f: FlagInfo): string => `\t\t${f.desc}`
    const short = (f: FlagInfo): string => `, -${f.short}`

    logger.info(`${pad}--${flag.key}${short(flag)}${desc(flag)}`)
    mods.forEach((m) => {
      logger.info(`${pad}\t--${m.key}${short(m)}${desc(m)}`)
    })
    logger.info()
  }
}
