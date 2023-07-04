import type { ActionParameters, Flag, SetModifiers } from '../models'
import type { ConfigService } from '../services'

import Log from '../logger.js'

export const SetFlag = {
  key: 'set',
  short: 's',
  description: 'set an alias',
  modifiers: [
    {
      key: 'shell',
      description: 'enable shell mode'
    },
    {
      key: 'env',
      format: /\w+=\w+/,
      description: 'add environment variables'
    }
  ],
  action: function set({ args, modifiers, data }: ActionParameters<SetModifiers>, configService: ConfigService): void {
    const separator = configService.getSeparator()
    const separatorIndex = args.indexOf(separator)
    if (separatorIndex === -1) {
      throw new Error(`Invalid Input, missing separator: '${separator}'`)
    }

    const key = args[separatorIndex - 1]
    let command = args.slice(separatorIndex + 1)

    if (!key || command.length === 0) {
      throw new Error('Invalid arguments passed')
    }

    if (command.length === 1) {
      command = command[0].split(' ')
    }

    const alias = configService.getAlias(key)

    const env: NodeJS.ProcessEnv = {}
    if (data.env && Array.isArray(data.env)) {
      data.env.forEach(val => {
        const [key, value] = val.split('=')
        env[key] = value
      })
    }

    if (alias) {
      Log.info(`Unset alias: ${key} ${separator} ${alias.command.join(' ')}`)
    }

    configService.setAlias(key, {
      options: {
        shell: !!modifiers.shell,
        env
      },
      command
    })

    Log.info(`Set alias: ${key} ${separator} ${command.join(' ')}`)

    if (!!modifiers.shell) {
      Log.info(`With SHELL: enabled`)
    }

    if (Object.values(env).length && Array.isArray(data.env)) {
      Log.info(`With ENV:\n\t${data.env.join('\n\t')}`)
    }
  }
} as Flag
