import type { Alias, Command, Config, Gist, MetaData, Options } from '../models/config.model.js'

import { homedir } from 'node:os'
import * as path from 'node:path'
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'process'
import { file } from '../utils/file.js'
import logger from '../utils/logger.js'
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

    const config = file.read(this.filePath)
    const baseConfig = JSON.parse(config) as Config

    this.#config = this.#mergeConfig(baseConfig)

    return this.#config
  }

  get isReady(): boolean {
    return file.exists(this.filePath)
  }

  get alias(): Alias {
    return this.config.alias ?? {}
  }

  get keys(): string[] {
    return Object.keys(this.alias)
  }

  get options(): Options {
    return this.config.options ?? {}
  }

  getAlias(key: string): Command | undefined {
    return this.alias[key]
  }

  setAlias(key: string, command: Command, project?: boolean): void {
    this.#updateAlias((projectConfig) => {
      projectConfig.alias = projectConfig.alias ?? {}
      projectConfig.alias[key] = command
    }, project)
  }

  removeAlias(key: string, project?: boolean): void {
    this.#updateAlias((projectConfig) => {
      if (!projectConfig.alias?.[key]) {
        return
      }

      const { [key]: _, ...rest } = projectConfig.alias
      projectConfig.alias = rest
    }, project)
  }

  #updateAlias(cb: (projectConfig: Config) => void, project?: boolean): void {
    let projectPath: string | undefined = this.filePath
    if (project) {
      projectPath = this.#projectFilePath
    }

    if (!projectPath) {
      throw new Error('no config file found in current directory or any parent directories')
    }

    const projectConfig = this.#readConfig(projectPath)
    if (!projectConfig) {
      return
    }

    cb(projectConfig)

    this.save(projectConfig, projectPath)
  }

  get shell(): boolean {
    return this.options.shell ?? process.platform === 'win32'
  }

  set shell(value: boolean) {
    this.options.shell = value
    this.save(this.config)
  }

  get token(): string {
    return this.gist.token ?? ''
  }

  set token(token: string) {
    this.gist.token = token
    this.save(this.config)
  }

  get gistId(): string {
    return this.gist.id ?? ''
  }

  set gistId(id: string) {
    this.gist.id = id
    this.save(this.config)
  }

  get meta(): MetaData {
    this.config.meta ??= {}

    return this.config.meta
  }

  set meta(meta: MetaData) {
    this.config.meta = meta
    this.save(this.config)
  }

  get gist(): Gist {
    this.meta.gist ??= {}

    return this.meta.gist
  }

  set gist(gist: Gist) {
    this.meta.gist = gist
    this.save(this.config)
  }

  async init(main?: boolean): Promise<void> {
    if (!file.exists(this.filePath)) {
      this.save(this.defaultConfig)
      logger.info('created config:', this.filePath)
      return
    }

    if (!main && file.exists(this.filePath)) {
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
      this.save(this.defaultConfig)
      logger.info('config reset:', this.filePath)
    }
  }

  save(config: Config, configPath?: string): void {
    file.write(configPath ?? this.filePath, config)
  }

  backup(config: Config): void {
    const backupPath = `${this.filePath}.backup-${Date.now().toString()}`
    this.save(config, backupPath)
    logger.info('backup created:', backupPath)
  }

  get #projectFilePath(): string | undefined {
    let current = process.cwd()
    const root = path.parse(current).root

    while (current !== root) {
      const candidate = path.join(current, this.fileName)

      if (file.exists(candidate)) {
        return candidate
      }

      current = path.dirname(current)
    }

    return undefined
  }

  #mergeConfig(base: Config): Config {
    const overrides = this.#projectFilePath && this.#readConfig(this.#projectFilePath)
    if (!overrides) {
      return base
    }

    Object.assign(base.options ?? {}, overrides.options)
    Object.assign(base.alias ?? {}, overrides.alias)

    return base
  }

  #readConfig(projectPath: string): Config | undefined {
    try {
      const projectConfig = file.read(projectPath)
      const parsed = JSON.parse(projectConfig) as Config

      return parsed
    } catch (_) {
      logger.error(new Error('failed to read config file'))
    }
  }
}
