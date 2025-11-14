import type { FlagData } from '../models/flag.model.js'
import { Flag } from './flag.js'

export class SyncFlag extends Flag {
  flag = {
    key: 'sync',
    short: 'sy',
    desc: 'backup/restore config from gist (default: restore)',
    run: (_: string[], data?: FlagData) => this.#sync(data)
  }

  mods = [
    {
      key: 'backup',
      short: 'b',
      desc: 'backup your current config',
      run: () => this.#backup()
    },
    {
      key: 'restore',
      short: 'r',
      desc: 'restore latest config from gist',
      run: () => this.#restore()
    }
  ]

  async #sync(data?: FlagData): Promise<boolean> {
    if (data && Object.keys(data).length > 0) {
      return true
    }

    await this.#restore()

    return true
  }

  async #restore(): Promise<boolean> {
    await this.gistService.restore()

    return true
  }

  async #backup(): Promise<boolean> {
    await this.gistService.backup()

    return true
  }
}
