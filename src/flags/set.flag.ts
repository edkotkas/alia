import type { AliasOptions } from '../models/config.model.js'

import path from 'path'
import logger from '../utils/logger.js'
import { Flag } from './flag.js'
import { toBool } from '../utils/to-bool.js'
import type { FlagInfo } from '../models/flag.model.js'

export class SetFlag extends Flag {
  #options: AliasOptions = {}

  flag: FlagInfo = {
    key: 'set',
    short: 's',
    desc: 'set an alias',
    run: (args: string[]) => this.#setAlias(args)
  }

  mods: FlagInfo[] = [
    {
      key: 'shell',
      short: 'sh',
      desc: 'enable shell mode (default: true)',
      run: (args: string[]) => this.#setShell(args)
    },
    {
      key: 'env',
      short: 'e',
      desc: 'add environment variables',
      run: (args: string[]) => this.#setEnv(args)
    },
    {
      key: 'env-file',
      short: 'ef',
      desc: 'add environment variables file',
      run: (args: string[]) => this.#setEnvFile(args)
    },
    {
      key: 'quote',
      short: 'q',
      desc: 'add quotes to command (default: true)',
      run: (args: string[]) => this.#setQuote(args)
    },
    {
      key: 'work-dir',
      short: 'wd',
      desc: 'run command in a specific directory',
      run: (args: string[]) => this.#setWorkDir(args)
    }
  ]

  #setQuote(data: string[]): boolean {
    const quote = toBool(data)
    if (quote === undefined) {
      logger.info(`invalid value for quote: ${data[0]}`)
      return false
    }

    this.#options.quote = quote
    logger.set('quote', this.#options.quote)

    return true
  }

  #setShell(data: string[]): boolean {
    const shell = toBool(data)
    if (shell === undefined) {
      logger.info(`invalid value for shell flag: ${data[0]}`)
      return false
    }

    this.#options.shell = shell
    logger.set('shell', this.#options.shell)

    return true
  }

  #setEnv(data: string[]): boolean {
    if (!data[0]) {
      logger.info(`invalid value for env flag: ${data[0]}`)
      return false
    }

    const invalid = data.find((val) => {
      const [key, value, ...rest] = val.split('=')
      return !key || !value || rest.length > 0
    })
    if (invalid) {
      logger.info(`invalid value for env flag: ${invalid}`)
      return false
    }

    const envData = data.reduce<Record<string, string>>((acc, val) => {
      const [key, value] = val.split('=')

      acc[key] = value

      return acc
    }, {})

    this.#options.env = { ...this.#options.env, ...envData }

    logger.info('ENV variables', '')
    Object.entries(this.#options.env).forEach(([key, val]) => {
      logger.info('\t', `${key}=${val}`)
    })

    return true
  }

  #setEnvFile(data: string[]): boolean {
    if (!data[0]) {
      logger.info(`invalid value for env-file flag: ${data[0]}`)
      return false
    }

    this.#options.envFile = path.resolve(data[0])
    logger.set('env File', this.#options.envFile)

    return true
  }

  #setWorkDir(args: string[]): boolean {
    if (!args[0]) {
      logger.info(`invalid value for work-dir flag: ${args[0]}`)
      return false
    }

    this.#options.workDir = path.resolve(args[0])
    logger.set('work dir', this.#options.workDir)

    return true
  }

  #setAlias(args: string[]): boolean {
    const separator = this.confService.separator
    const separatorIndex = args.findIndex((a) => a === separator)
    if (separatorIndex === -1) {
      logger.info(`invalid input, missing separator: ${separator}`)
      return false
    }

    const key = args[separatorIndex - 1]
    let command = args.slice(separatorIndex + 1)

    if (!key || command.length === 0) {
      logger.info(`invalid arguments passed: '${key || ''}' ${separator} '${command.join(' ')}'`)
      return false
    }

    if (command.length === 1) {
      command = command[0].split(' ')
    }

    const alias = this.confService.getAlias(key)

    if (alias) {
      logger.info(`unset alias: ${key} ${separator} ${alias.command.join(' ')}`)
    }

    this.confService.setAlias(key, {
      options: this.#options,
      command
    })

    logger.info(`set alias: ${key} ${separator} ${command.join(' ')}`)

    return true
  }
}
