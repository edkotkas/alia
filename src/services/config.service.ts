import * as fs from 'node:fs'
import * as path from 'node:path'
import { homedir } from 'node:os'
import * as readline from 'node:readline/promises'
import type { Interface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'process'

import type { Config, Command, MetaData, FSWrapper, RLWrapper } from '../models'

import Log from '../logger.js'

export class ConfigService {

  public fs: FSWrapper = {
    write: (path: string, data: Config): void => fs.writeFileSync(path, JSON.stringify(data, null, 2)),
    read: (path: string) => fs.readFileSync(path, 'utf-8'),
    exists: (path: string): boolean => fs.existsSync(path)
  }

  public rl: RLWrapper = {
    question: (rli: Interface, question: string): Promise<string> => rli.question(question)
  }

  public fileName = '.alia.json'
  public defaultConfig: Config = {
    version: 1,
    meta: {
      gist: {
        token: "",
        id: ""
      }
    },
    options: {
      separator: "@",
      shell: false
    },
    alias: {
      test: {
        options: {
          shell: false
        },
        command: [
          "echo",
          "alia",
          "is",
          "working!"
        ]
      }
    }
  }

  public filePath = path.join(homedir(), this.fileName)

  private _config: Config | undefined
  get config(): Config {
    if (this._config) {
      return this._config
    }

    const config = this.fs.read(this.filePath)
    try {
      this._config = JSON.parse(config) as Config
      return this._config
    }
    catch (e) {
      Log.info('Failed to load config:', this.filePath)
      Log.info('Make sure to run: al --init')
      throw e
    }
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

  public getSeparator(): string {
    return this.config.options.separator
  }

  public setSeparator(separator?: string): void {
    this.config.options.separator = separator
      ? separator
      : this.defaultConfig.options.separator

    this.save(this.config)
  }

  public getShell(): boolean {
    return this.config.options.shell
  }

  public setShell(value: boolean): void {
    this.config.options.shell = value
  }

  public getToken(): string {
    return this.config.meta.gist.token
  }

  public setToken(token: string): void {
    this.config.meta.gist.token = token
    this.save(this.config)
  }

  public getGistId(): string {
    return this.config.meta.gist.id
  }

  public setGistId(id: string): void {
    this.config.meta.gist.id = id
    this.save(this.config)
  }

  public getMetaData(): MetaData {
    return this.config.meta
  }

  public async init(): Promise<void> {
    if (this.fs.exists(this.filePath)) {
      const answer = await this.rl.question(
        readline.createInterface({input, output}), 
        `Config already exists at: ${this.filePath}\nWould you like to overwrite (y/n): `
      )
      if (answer.toLowerCase() !== 'y') {
        return
      }
    }

    this.save(this.defaultConfig)
    Log.info('Created config:', this.filePath)
  }

  public save(config: Config): void {
    this.fs.write(this.filePath, config)
  }
}
