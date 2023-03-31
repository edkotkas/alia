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

    const shell = this.configService.getShell()

    const [command, ...parameters] = al.command.concat(args)
    const options: SpawnOptions = {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: shell || al.options.shell,
      env: Object.assign(process.env, al.options.env ?? {})
    }

    child.spawnSync(command, parameters, options)
  }
}
