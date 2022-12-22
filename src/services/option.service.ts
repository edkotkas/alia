import pkg from '../../package.json' assert { type: 'json' }
import type { Flag, ActionParameters, ConfModifiers, SetModifiers, SyncModifiers, ListModifiers, Alias, FlagModifiers } from '../models'

import { Log } from '../logger.js'
import type { ConfigService, GistService } from './index.js'

export class OptionService {
  constructor(
    private configService: ConfigService,
    private gistService: GistService
  ) {
  }

  public flags: Flag[] = [
    {
      full: 'version',
      short: 'v',
      action: (): Promise<void> => Promise.resolve(this.version())
    },
    {
      full: 'help',
      short: 'h',
      action: (): Promise<void> => Promise.resolve(this.help())
    },
    {
      full: 'set',
      short: 's',
      modifiers: ['shell', {
        key: 'env',
        format: /\w+=\w+/
      }],
      action: (params): Promise<void> => Promise.resolve(this.set(params))
    },
    {
      full: 'remove',
      short: 'r',
      action: (params): Promise<void> => Promise.resolve(this.remove(params))
    },
    {
      full: 'list',
      short: 'l',
      modifiers: ['sort'],
      action: (params): Promise<void> => Promise.resolve(this.list(params))
    },
    {
      full: 'conf',
      short: 'c',
      modifiers: ['separator', 'token', 'gist', 'path'],
      action: (params): Promise<void> => Promise.resolve(this.conf(params))
    },
    {
      full: 'sync',
      short: 'sy',
      modifiers: ['push', 'pull'],
      action: (params): Promise<void> => this.sync(params)
    }
  ]

  public version(): void {
    Log.info(pkg.version)
  }

  public help(): void {
    const separator = this.configService.getSeparator()
    Log.info(`
      Usage

        $ al [options] [alias] [${separator}] [command]

      Options

        --version, -v     show version
        --help, -h        show this

        --set, -s         set alias
          --shell             enable shell mode

        --remove, -r      remove alias

        --list, -l        list available alias
          --sort              sort alphabetically

        --conf, -c        change alia configuration
          --separator=[string]                set alias separator (default: @)
          --=token=<your github api token>    set the api token for gist sync
          --gist=<your gist id>               set the gist id to use for sync
          --path                              show config file path

        --sync, -sy        backup/restore your config (default: restore)
          --push             backup your current config
          --pull             restore config from gist

      Examples

        $ al -s gp ${separator} git push
          > Added: gp ${separator} git push

        $ al gp
          > git push

        $ al -r gp
          > Removed: gp
  `)
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
    if (Object.values(env).length && Array.isArray(data.env)) {
      Log.info(`With ENV:\n\t${data.env.join('\n\t')}`)
    }
  }

  public remove({ args: [key] }: ActionParameters<FlagModifiers>): void {
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

  public async sync({ modifiers } : ActionParameters<SyncModifiers>): Promise<void> {
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
