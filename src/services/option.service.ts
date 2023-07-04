import type {
  Flag, ModifierData
} from '../models'
import type { ConfigService } from './index.js'

import { 
  VersionFlag, InitFlag, SetFlag, 
  ListFlag, RemoveFlag, ConfFlag, 
  SyncFlag 
} from '../flags/index.js'

import Log from '../logger.js'

export class OptionService {
  constructor(
    private configService: ConfigService
  ) {
  }

  public flags: Flag[] = [
    {
      key: 'help',
      short: 'h',
      description: 'show help',
      action: (): void => {
        this.help()
      }
    },
    VersionFlag,
    InitFlag,
    SetFlag,
    RemoveFlag,
    ListFlag,
    ConfFlag,
    SyncFlag
  ]

  public help(): void {
    Log.info(`
      Usage:

        $ al [options] [alias] [separator] [command]

      Options:
    `)

    this.flags
      .forEach((flag) => {
        const short = flag.short
          ? `, -${flag.short}`
          : ''

        const desc = (f: Flag | ModifierData): string => f.description
          ? `\t${f.description}`
          : ''

        Log.info(`\t--${flag.key}${short}${desc(flag)}`)
        const mods = (flag.modifiers?.filter(m => m.description) ?? [])
        if (mods.length) {
          mods.forEach(m => {
            Log.info(`\t  --${m.key} ${desc(m)}`)
          })
        }
        Log.info('')
      })

    const separator = this.configService.getSeparator()

    Log.info(`
      Examples:

        $ al -s gp ${separator} git push
          > Added: gp ${separator} git push

        $ al gp
          > git push

        $ al -r gp
          > Removed: gp
    `)
  }
}
