import path from 'path'
import { fileURLToPath } from 'url'

import logger from '../logger.js'
import { Flag } from './flag.js'
import type { FlagInfo } from '../models/flag.model.js'
import type { PackageJson } from '../models/fs-wrapper.model.js'
import { file } from '../utils/file.js'

export class VersionFlag extends Flag {
  flag: FlagInfo = {
    key: 'version',
    short: 'v',
    desc: 'show version',
    run: (): undefined => this.version(),
    noConf: true
  }

  private version(): undefined {
    const dirname = fileURLToPath(new URL('.', import.meta.url))
    const filePath = path.resolve(dirname, '..', '..', 'package.json')
    const pkg = JSON.parse(file.read(filePath)) as PackageJson

    logger.info(pkg.version)
  }
}
