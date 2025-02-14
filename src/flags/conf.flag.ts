import type { FlagInfo } from '../models/flag.model.js'

import logger from '../utils/logger.js'
import { Flag } from './flag.js'
import { toBool } from '../utils/to-bool.js'

export class ConfFlag extends Flag {
  flag: FlagInfo = {
    key: 'conf',
    short: 'c',
    desc: 'alia config (must specify an option)'
  }

  mods: FlagInfo[] = [
    {
      key: 'separator',
      short: 's',
      desc: 'set alias separator (default: @)',
      run: (args: string[]) => this.setSeparator(args)
    },
    {
      key: 'shell',
      short: 'sh',
      desc: 'set global shell mode',
      run: (args: string[]) => this.setShell(args)
    },
    {
      key: 'token',
      short: 't',
      desc: 'set the personal access token for gist sync',
      run: (args: string[]) => this.setToken(args)
    },
    {
      key: 'gist',
      short: 'g',
      desc: 'set the gist id to use for sync',
      run: (args: string[]) => this.setGist(args)
    },
    {
      key: 'path',
      short: 'p',
      desc: 'show config file path',
      run: () => this.showPath()
    }
  ]

  private setSeparator(args: string[]): boolean {
    this.confService.separator = args[0] ?? this.confService.defaultConfig.options.separator
    logger.set('separator', this.confService.separator)

    return true
  }

  private setGist(args: string[]): boolean {
    if (!args[0]) {
      logger.info('must specify a gist id')
      return false
    }

    this.confService.gistId = args[0]
    logger.set('gist', this.confService.gistId)

    return true
  }

  private setToken(args: string[]): boolean {
    if (!args[0]) {
      logger.info('must specify a token')
      return false
    }

    this.confService.token = args[0]
    logger.set('token', this.confService.token)

    return true
  }

  private setShell(args: string[]): boolean {
    const shell = toBool(args)
    if (shell === undefined) {
      logger.info(`invalid value for shell flag: ${args[0]}`)
      return false
    }

    this.confService.shell = shell
    logger.set('shell', this.confService.shell)

    return true
  }

  private showPath(): boolean {
    logger.info(this.confService.filePath)

    return true
  }
}
