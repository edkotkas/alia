import type { AliasOptions } from '../models/config.model.js'

import path from 'path'
import logger from '../logger.js'
import { Flag } from './flag.js'
import { toBool } from '../utils/to-bool.js'

export class SetFlag extends Flag {
  private options: AliasOptions = {}

  flag = {
    key: 'set',
    short: 's',
    desc: 'set an alias',
    run: (args: string[]): boolean | undefined => this.setAlias(args)
  }

  mods = [
    {
      key: 'shell',
      short: 'sh',
      desc: 'enable shell mode',
      run: (args: string[]): boolean | undefined => this.setShell(args)
    },
    {
      key: 'env',
      short: 'e',
      desc: 'add environment variables',
      run: (args: string[]): boolean | undefined => this.setEnv(args)
    },
    {
      key: 'env-file',
      short: 'ef',
      desc: 'add environment variables file',
      run: (args: string[]): boolean | undefined => this.setEnvFile(args)
    }
  ]

  private setShell(data: string[]): boolean | undefined {
    const shell = toBool(data)
    if (shell === undefined) {
      logger.info(`invalid value for shell: '${data[0]}'`)
      return true
    }

    this.options.shell = shell
    logger.set('shell', this.options.shell)
  }

  private setEnv(data: string[]): boolean | undefined {
    if (!data[0]) {
      logger.info(`invalid value for env`)
      return true
    }

    logger.set('ENV variables', '')
    data.forEach((val) => {
      logger.info('\t', val)
      const [key, value] = val.split('=')
      this.options.env = {
        ...(this.options.env ?? {}),
        [key]: value
      }
    })
  }

  private setEnvFile(data: string[]): boolean | undefined {
    if (!data[0]) {
      logger.info(`invalid value for env-file`)
      return true
    }

    this.options.envFile = path.resolve(data[0])
    logger.set('ENV File', this.options.envFile)
  }

  private setAlias(args: string[]): boolean | undefined {
    const separator = this.confService.separator
    const separatorIndex = args.findIndex((a) => a === separator)
    if (separatorIndex === -1) {
      logger.info(`invalid input, missing separator: '${separator}'`)
      return true
    }

    const key = args[separatorIndex - 1]
    let command = args.slice(separatorIndex + 1)

    if (!key || command.length === 0) {
      logger.info(`invalid arguments passed: '${key || ''}' ${separator} '${command.join(' ')}'`)
      return true
    }

    if (command.length === 1) {
      command = command[0].split(' ')
    }

    const alias = this.confService.getAlias(key)

    if (alias) {
      logger.info(`unset alias: ${key} ${separator} ${alias.command.join(' ')}`)
    }

    this.confService.setAlias(key, {
      options: this.options,
      command
    })

    logger.info(`set alias: ${key} ${separator} ${command.join(' ')}`)
  }
}
