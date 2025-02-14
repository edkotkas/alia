import type { SpawnOptions } from 'node:child_process'
import type { ConfigService } from './config.service.js'

import child from 'node:child_process'
import dotenv from 'dotenv'
import logger from '../utils/logger.js'

export class CommandService {
  constructor(private configService: ConfigService) {}

  run(args: string[]): void {
    const key = args.shift()
    if (!key) {
      throw new Error('no arguments provided for command')
    }

    const al = this.configService.getAlias(key)
    if (!al) {
      logger.info(`alias not set: ${key}`)
      return
    }

    const shell = this.configService.shell

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

    const [command, ...parameters] = al.command.concat(args)
    const options: SpawnOptions = {
      cwd: al.options.workDir ?? process.cwd(),
      stdio: 'inherit',
      shell: al.options.shell ?? shell,
      env: Object.assign(process.env, al.options.env)
    }

    child.spawnSync(command, parameters, options)
  }
}
