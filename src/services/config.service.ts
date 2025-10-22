import type { Config, Command, MetaData, Alias, Options } from '../models/config.model.js'

import * as path from 'node:path'
import { homedir } from 'node:os'
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'process'
import logger from '../utils/logger.js'
import { file } from '../utils/file.js'
import { read } from '../utils/read.js'

export class ConfigService {
  readonly fileName = '.alia.json'
  readonly filePath = path.join(homedir(), this.fileName)

  get defaultConfig(): Config {
    const cfgPath = path.resolve(import.meta.dirname, '..', '..', 'data', 'config.default.json')
    const cfgFile = file.read(cfgPath)
    const cfg = JSON.parse(cfgFile) as Config

    return cfg
  }

  #config: Config | undefined
  get config(): Config {
    if (this.#config) {
      return this.#config
    }

    try {
      const config = file.read(this.filePath)
      this.#config = JSON.parse(config) as Config
      return this.#config
    } catch (_) {
      return this.defaultConfig
    }
  }

  get isReady(): boolean {
    return file.exists(this.filePath)
  }

  get alias(): Alias {
    return this.config.alias
  }

  get keys(): string[] {
    return Object.keys(this.config.alias)
  }

  get options(): Options {
    return this.config.options
  }

  getAlias(key: string): Command | undefined {
    return this.config.alias[key]
  }

  setAlias(key: string, command: Command): void {
    this.config.alias[key] = command
    this.save(this.config)
  }

  removeAlias(key: string): void {
    const { [key]: _, ...rest } = this.config.alias
    this.config.alias = rest
    this.save(this.config)
  }

  get separator(): string {
    return this.config.options.separator
  }

  set separator(separator: string) {
    this.config.options.separator = separator
    this.save(this.config)
  }

  get shell(): boolean {
    return this.config.options.shell ?? process.platform === 'win32'
  }

  set shell(value: boolean) {
    this.config.options.shell = value
    this.save(this.config)
  }

  get token(): string {
    return this.meta.gist.token
  }

  set token(token: string) {
    this.meta.gist.token = token
    this.save(this.config)
  }

  get gistId(): string {
    return this.meta.gist.id
  }

  set gistId(id: string) {
    this.meta.gist.id = id
    this.save(this.config)
  }

  get meta(): MetaData {
    return this.config.meta
  }

  async init(): Promise<void> {
    if (file.exists(this.filePath)) {
      const rli = readline.createInterface({ input, output })
      const answer = await read.question(
        rli,
        `config already exists at: ${this.filePath}\nwould you like to overwrite (y/n): `
      )

      rli.close()

      if (!/y(es)?/i.test(answer)) {
        return
      }

      this.backup(this.config)
    }

    this.save(this.defaultConfig)
    logger.info('created config:', this.filePath)
  }

  save(config: Config): void {
    file.write(this.filePath, config)
  }

  backup(config: Config): void {
    const backupPath = `${this.filePath}.backup-${Date.now().toString()}`
    file.write(backupPath, config)
    logger.info('backup created:', backupPath)
  }
}
