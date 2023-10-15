import type { FlagInfo } from '../models/flag.model.js'

import logger from '../logger.js'
import { Flag } from './flag.js'
import { toBool } from '../utils/to-bool.js'

export class ConfFlag extends Flag {
  flag = {
    key: 'conf',
    short: 'c',
    desc: 'alia config (must specify an option)'
  }

  mods: FlagInfo[] = [
    {
      key: 'separator',
      short: 's',
      desc: 'set alias separator (default: @)',
      run: (args: string[]): undefined => this.setSeparator(args)
    },
    {
      key: 'shell',
      short: 'sh',
      desc: 'set global shell mode',
      run: (args: string[]): undefined => this.setShell(args)
    },
    {
      key: 'token',
      short: 't',
      desc: 'set the personal access token for gist sync',
      run: (args: string[]): undefined => this.setToken(args)
    },
    {
      key: 'gist',
      short: 'g',
      desc: 'set the gist id to use for sync',
      run: (args: string[]): undefined => this.setGist(args)
    },
    {
      key: 'path',
      short: 'p',
      desc: 'show this.confservice file path',
      run: (): undefined => this.showPath()
    }
  ]

  private setSeparator(args: string[]): undefined {
    this.confService.separator = args[0] ?? this.confService.defaultConfig.options.separator
    logger.set('separator', this.confService.separator)
  }

  private setGist(args: string[]): undefined {
    if (!args[0]) {
      logger.info('must specify a gist id')
      return
    }

    this.confService.gistId = args[0]
    logger.set('gist', this.confService.gistId)
  }

  private setToken(args: string[]): undefined {
    if (!args[0]) {
      logger.info('must specify a token')
      return
    }

    this.confService.token = args[0]
    logger.set('token', this.confService.token)
  }

  private setShell(args: string[]): undefined {
    const shell = toBool(args)
    if (shell === undefined) {
      logger.info(`invalid value for shell: '${args[0]}'`)
      return
    }

    this.confService.shell = shell
    logger.set('shell', this.confService.shell)
  }

  private showPath(): undefined {
    logger.info(this.confService.filePath)
  }
}
