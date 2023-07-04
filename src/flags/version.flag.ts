import type { Flag } from '../models'
import pkg from '../../package.json' assert { type: 'json' }
import Log from '../logger.js'

export const VersionFlag = {
    key: 'version',
    short: 'v',
    description: 'show version',
    action: function version(): Promise<void> {
      Log.info(pkg.version)
      return Promise.resolve()
    }
} as Flag
