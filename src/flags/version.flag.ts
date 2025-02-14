import path from 'path'

import logger from '../utils/logger.js'
import { Flag } from './flag.js'
import type { FlagInfo } from '../models/flag.model.js'
import type { PackageJson } from '../models/fs-wrapper.model.js'
import { file } from '../utils/file.js'

export class VersionFlag extends Flag {
  flag: FlagInfo = {
    key: 'version',
    short: 'v',
    desc: 'show version',
    run: () => this.version(),
    noConf: true
  }

  private version(): boolean {
    const filePath = path.resolve(import.meta.dirname, '..', '..', 'package.json')
    const pkg = JSON.parse(file.read(filePath)) as PackageJson

    logger.info(pkg.version)

    return true
  }
}
