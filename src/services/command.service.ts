import type { SpawnOptions } from 'node:child_process'
import { ConfigService } from './config.service.js'

import dotenv from 'dotenv'
import child from 'node:child_process'
import { inject } from '../utils/di.js'
import logger from '../utils/logger.js'

export class CommandService {
  readonly #configService = inject(ConfigService)

  run(args: string[]): void {
    const key = args.shift()
    if (!key) {
      throw new Error('no arguments provided for command')
    }

    const al = this.#configService.getAlias(key)
    if (!al) {
      logger.info(`alias not set: ${key}`)
      return
    }

    const configShell = this.#configService.shell

    if (al.options.envFile) {
      const env = dotenv.config({
        path: al.options.envFile
      })

      if (env.error) {
        throw env.error
      }

      if (!env.parsed) {
        throw new Error(`failed to parse env file: ${al.options.envFile}`)
      }

      al.options.env = Object.assign(env.parsed, al.options.env)
    }

    if (al.options.quote) {
      args = args.map((arg) => `"${arg}"`)
    }

    const shell = al.options.shell ?? configShell
    let cmd: string, parameters: string[]
    if (shell) {
      cmd = [...al.command, ...args].join(' ')
      parameters = []
    } else {
      const combined = al.command.concat(args)
      cmd = combined[0]
      parameters = combined.slice(1)
    }

    const options: SpawnOptions = {
      cwd: al.options.workDir ?? process.cwd(),
      stdio: 'inherit',
      shell,
      env: Object.assign(process.env, al.options.env)
    }

    child.spawnSync(cmd, parameters, options)
  }
}
