import type { FlagData } from '../models/flag.model.js'
import { Flag } from './flag.js'

export class SyncFlag extends Flag {
  flag = {
    key: 'sync',
    short: 'sy',
    desc: 'backup/restore config from gist (default: restore)',
    run: (args: string[], data?: FlagData): Promise<undefined> => this.sync(args, data)
  }

  mods = [
    {
      key: 'backup',
      short: 'b',
      desc: 'backup your current config',
      run: (): Promise<undefined> => this.backup()
    },
    {
      key: 'restore',
      short: 'r',
      desc: 'restore latest config from gist',
      run: (): Promise<undefined> => this.restore()
    }
  ]

  private async sync(_: string[], data: FlagData = {}): Promise<undefined> {
    if (Object.values(data).length) {
      return
    }

    await this.restore()
  }

  private async restore(): Promise<undefined> {
    await this.gistService.restore()
  }

  private async backup(): Promise<undefined> {
    await this.gistService.backup()
  }
}
