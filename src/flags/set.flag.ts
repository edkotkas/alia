import type { AliasOptions } from '../models/config.model.js'

import path from 'path'
import logger from '../utils/logger.js'
import { Flag } from './flag.js'
import { toBool } from '../utils/to-bool.js'
import type { FlagInfo } from '../models/flag.model.js'

export class SetFlag extends Flag {
  #options: AliasOptions = {}

  #command!: string[]
  #key!: string

  flag: FlagInfo = {
    key: 'set',
    short: 's',
    desc: 'set an alias',
    run: (_: string[]) => this.#setAlias()
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
      desc: 'add environment variables (key=value)',
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
    },
    {
      key: 'key',
      short: 'k',
      desc: 'the alias key to set',
      required: true,
      run: (args: string[]) => this.#setKey(args)
    },
    {
      key: 'command',
      short: 'c',
      desc: 'the command to set as alias (group multiple args with quotes)',
      required: true,
      run: (args: string[]) => this.#setCommand(args)
    }
  ]

  #setKey(data: string[]): boolean {
    if (!data[0]) {
      logger.info(`no value provided for key`)
      return false
    }

    this.#key = data[0]
    return true
  }

  #setCommand(data: string[]): boolean {
    if (data.length === 0) {
      logger.info(`no value provided for command`)
      return false
    }

    this.#command = data[0].split(' ')

    return true
  }

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

  #setAlias(): boolean {
    const alias = this.confService.getAlias(this.#key)

    if (alias) {
      logger.info(`unset alias: ${this.#key} => ${alias.command.join(' ')}`)
    }

    this.confService.setAlias(this.#key, {
      options: this.#options,
      command: this.#command
    })

    logger.info(`set alias: ${this.#key} => ${this.#command.join(' ')}`)

    return true
  }
}
