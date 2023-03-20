import pkg from '../../package.json' assert { type: 'json' }
import type { 
  Flag, ActionParameters, ConfModifiers, 
  SetModifiers, SyncModifiers, ListModifiers, 
  Alias, ModifierData 
} from '../models'

import Log from '../logger.js'
import type { ConfigService, GistService } from './index.js'

export class OptionService {
  constructor(
    private configService: ConfigService,
    private gistService: GistService
  ) {
  }

  public flags: Flag[] = [
    {
      key: 'version',
      short: 'v',
      description: 'show version',
      action: (): Promise<void> => Promise.resolve(this.version())
    },
    {
      key: 'help',
      short: 'h',
      description: 'show help',
      action: (): Promise<void> => Promise.resolve(this.help())
    },
    {
      key: 'init',
      short: 'i',
      description: 'initialize config',
      action: (): Promise<void> => this.init()
    },
    {
      key: 'set',
      short: 's',
      description: 'set an alias',
      modifiers: [
        {
          key: 'shell',
          description: 'enable shell mode'
        },
        {
          key: 'env',
          format: /\w+=\w+/,
          description: 'add environment variables'
        }
      ],
      action: (params): Promise<void> => Promise.resolve(this.set(params))
    },
    {
      key: 'remove',
      short: 'r',
      description: 'remove an alias',
      action: (params): Promise<void> => Promise.resolve(this.remove(params))
    },
    {
      key: 'list',
      short: 'l',
      description: 'list available alias',
      modifiers: [
        {
          key: 'sort',
          description: 'sort alphabetically'
        }
      ],
      action: (params): Promise<void> => Promise.resolve(this.list(params))
    },
    {
      key: 'conf',
      short: 'c',
      description: 'alia config (must use specify option)',
      modifiers: [
        {
          key: 'separator',
          description: 'set alias separator (default: @)'
        },
        {
          key: 'token',
          description: 'set the personal access token for gist sync'
        },
        {
          key: 'gist',
          description: 'set the gist id to use for sync'
        },
        {
          key: 'path',
          description: 'show config file path'
        }
      ],
      action: (params): Promise<void> => Promise.resolve(this.conf(params))
    },
    {
      key: 'sync',
      short: 'sy',
      description: 'backup/restore config from gist (default: restore)',
      modifiers: [
        {
          key: 'push',
          description: 'backup your current config'
        },
        {
          key: 'pull',
          description: 'restore latest config from gist'
        }
      ],
      action: (params): Promise<void> => this.sync(params)
    }
  ]

  public version(): void {
    Log.info(pkg.version)
  }

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
            Log.info(`\t  --${m.key}${desc(m)}`)
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

  public async init(): Promise<void> {
    await this.configService.init()
  }

  public set({ args, modifiers, data }: ActionParameters<SetModifiers>): void {
    const separator = this.configService.getSeparator()
    const separatorIndex = args.indexOf(separator)
    if (separatorIndex === -1) {
      throw new Error(`Invalid Input, missing separator: '${separator}'`)
    }

    const key = args[separatorIndex - 1]
    let command = args.slice(separatorIndex + 1)

    if (!key || command.length === 0) {
      throw new Error('Invalid arguments passed')
    }

    if (command.length === 1) {
      command = command[0].split(' ')
    }

    const alias = this.configService.getAlias(key)

    const env: NodeJS.ProcessEnv = {}
    if (data.env && Array.isArray(data.env)) {
      data.env.reduce((acc, val) => {
        const [key, value] = val.split('=')
        acc[key] = value
        return acc
      }, env)
    }

    if (alias) {
      Log.info(`Unset alias: ${key} ${separator} ${alias.command.join(' ')}`)
    }

    this.configService.setAlias(key, {
      options: {
        shell: !!modifiers.shell,
        env
      },
      command
    })

    Log.info(`Set alias: ${key} ${separator} ${command.join(' ')}`)

    if (!!modifiers.shell) {
      Log.info(`With SHELL: enabled`)
    }

    if (Object.values(env).length && Array.isArray(data.env)) {
      Log.info(`With ENV:\n\t${data.env.join('\n\t')}`)
    }
  }

  public remove({ args: [key] }: ActionParameters): void {
    if (!this.configService.getAlias(key)) {
      throw new Error(`Alias '${key}' does not exist`)
    }

    this.configService.removeAlias(key)
    Log.info(`Removed alias: ${key}`)
  }

  private mapList(alias: Alias): string[] {
    return Object.keys(alias)
      .map(key => `${key} \t${this.configService.getSeparator()} \t${alias[key].command.join(' ')}`)
  }

  public list({ modifiers }: ActionParameters<ListModifiers>): void {
    const l = this.mapList(this.configService.config.alias)
    Log.info((modifiers.sort ? l.sort() : l).join('\n'))
  }

  public async sync({ modifiers }: ActionParameters<SyncModifiers>): Promise<void> {
    if (Object.keys(modifiers).length === 0 || modifiers.pull) {
      return await this.gistService.pull()
    }

    if (modifiers.push) {
      return await this.gistService.push()
    }

    throw new Error('Invalid arguments passed')
  }

  public conf({ modifiers, data }: ActionParameters<ConfModifiers>): void {
    if (Object.keys(modifiers).length === 0) {
      throw new Error('Invalid arguments passed')
    }

    if (modifiers.separator) {
      this.configService.setSeparator(data.separator as string)
      Log.info(`Set the separator to:`, this.configService.getSeparator())
    }

    if (modifiers.gist) {
      if (!data.gist) {
        throw new Error('No gist id provided')
      }

      this.configService.setGistId(data.gist as string)
    }

    if (modifiers.token) {
      if (!data.token) {
        throw new Error('No token provided')
      }

      this.configService.setToken(data.token as string)
    }

    if (modifiers.path) {
      Log.info('Config path:', this.configService.filePath)
    }
  }
}
