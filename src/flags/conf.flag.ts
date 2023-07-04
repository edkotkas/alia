import type { ActionParameters, ConfModifiers, Flag } from '../models'
import type { ConfigService } from '../services'

import Log from '../logger.js'

export const ConfFlag: Flag = {
  key: 'conf',
  short: 'c',
  description: 'alia config (must use specify option)',
  modifiers: [
    {
      key: 'separator',
      description: 'set alias separator (default: @)'
    },
    {
      key: 'token',
      description: 'set the personal access token for gist sync'
    },
    {
      key: 'gist',
      description: 'set the gist id to use for sync'
    },
    {
      key: 'path',
      description: 'show config file path'
    },
    {
      key: 'verbose',
      description: 'enable verbose output'
    }
  ],
  action: function conf(params: ActionParameters<ConfModifiers>, config: ConfigService): void {
    const { modifiers, data } = params
    if (Object.keys(modifiers).length === 0) {
      throw new Error('Invalid arguments passed')
    }

    if (modifiers.separator) {
      config.setSeparator(data.separator as string)
      Log.info(`Set the separator to:`, config.getSeparator())
    }

    if (modifiers.gist) {
      if (!data.gist) {
        throw new Error('No gist id provided')
      }

      config.setGistId(data.gist as string)
    }

    if (modifiers.token) {
      if (!data.token) {
        throw new Error('No token provided')
      }

      config.setToken(data.token as string)
    }

    if (modifiers.shell) {
      if (!data.shell) {
        throw new Error('No shell value provided')
      }

      config.setShell(Boolean(data.shell))
    }

    if (modifiers.path) {
      Log.info(config.filePath)
    }

    if (modifiers.verbose) {
      if (!data.verbose) {
        throw new Error('No verbose value provided')
      }

      config.setVerbose(Boolean(data.verbose))
    }
  }
}
