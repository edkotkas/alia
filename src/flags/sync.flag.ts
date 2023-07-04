import type { ActionParameters, Flag, SyncModifiers } from '../models'
import type { ConfigService, GistService } from '../services'

export const SyncFlag = {
  key: 'sync',
  short: 'sy',
  description: 'backup/restore config from gist (default: restore)',
  modifiers: [
    {
      key: 'push',
      description: 'backup your current config'
    },
    {
      key: 'pull',
      description: 'restore latest config from gist'
    }
  ],
  action: function sync({ modifiers }: ActionParameters<SyncModifiers>, _: ConfigService, gist: GistService): Promise<void> {
    if (Object.keys(modifiers).length === 0 || modifiers.pull) {
      return gist.pull()
    }

    if (modifiers.push) {
      return gist.push()
    }

    throw new Error('Invalid arguments passed')
  }
} as Flag
