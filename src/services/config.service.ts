import type { Config, Command, MetaData, Alias, Options } from '../models/config.model.js'

import * as path from 'node:path'
import { homedir } from 'node:os'
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'process'
import logger from '../logger.js'
import { file } from '../utils/file.js'
import { read } from '../utils/read.js'

export class ConfigService {
  public fileName = '.alia.json'
  public defaultConfig: Config = {
    version: 1,
    meta: {
      gist: {
        token: '',
        id: ''
      }
    },
    options: {
      separator: '@',
      shell: false
    },
    alias: {
      test: {
        options: {},
        command: ['echo', 'alia', 'is', 'working!']
      }
    }
  }

  public filePath = path.join(homedir(), this.fileName)

  private _config: Config | undefined
  public get config(): Config {
    if (this._config) {
      return this._config
    }

    try {
      const config = file.read(this.filePath)
      this._config = JSON.parse(config) as Config
      return this._config
    } catch (e) {
      return this.defaultConfig
    }
  }

  public get isReady(): boolean {
    return JSON.stringify(this.config) != JSON.stringify(this.defaultConfig) && Boolean(this._config)
  }

  public get alias(): Alias {
    return this.config.alias
  }

  public get keys(): string[] {
    return Object.keys(this.config.alias)
  }

  public get options(): Options {
    return this.config.options
  }

  public getAlias(key: string): Command | undefined {
    return this.config.alias[key]
  }

  public setAlias(key: string, command: Command): void {
    this.config.alias[key] = command
    this.save(this.config)
  }

  public removeAlias(key: string): void {
    const { [key]: _, ...rest } = this.config.alias
    this.config.alias = rest
    this.save(this.config)
  }

  public get separator(): string {
    return this.config.options.separator
  }

  public set separator(separator: string) {
    this.config.options.separator = separator
    this.save(this.config)
  }

  public get shell(): boolean {
    return this.config.options.shell
  }

  public set shell(value: boolean) {
    this.config.options.shell = value
    this.save(this.config)
  }

  public get token(): string {
    return this.meta.gist.token
  }

  public set token(token: string) {
    this.meta.gist.token = token
    this.save(this.config)
  }

  public get gistId(): string {
    return this.meta.gist.id
  }

  public set gistId(id: string) {
    this.meta.gist.id = id
    this.save(this.config)
  }

  public get meta(): MetaData {
    return this.config.meta
  }

  public async init(): Promise<void> {
    if (file.exists(this.filePath)) {
      const rli = readline.createInterface({ input, output })
      const answer = await read.question(
        rli,
        `Config already exists at: ${this.filePath}\nWould you like to overwrite (y/n): `
      )

      rli.close()

      if (!/y(es)?/i.test(answer)) {
        return
      }
    }

    this.save(this.defaultConfig)
    logger.info('Created config:', this.filePath)
  }

  public save(config: Config): void {
    file.write(this.filePath, config)
  }
}
