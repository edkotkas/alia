import type { SpawnOptions } from 'node:child_process'
import child from 'node:child_process'

import type { ConfigService } from './index.js'

export class CommandService {
  constructor(
    private configService: ConfigService
  ) {
  }

  public run(args: string[]): void {
    const key = args.shift()
    if (!key) {
      throw new Error('No arguments provided for command')
    }

    const al = this.configService.getAlias(key)
    if (!al) {
      throw new Error(`Alias not set: ${key}`)
    }

    const [command, ...parameters] = al.command.concat(args)
    const options: SpawnOptions = {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: al.options.shell
    }

    child.spawnSync(command, parameters, options)
  }
}
