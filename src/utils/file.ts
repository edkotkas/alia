import type { FSWrapper } from '../models/fs-wrapper.model'
import type { Config } from '../models/config.model'

import * as fs from 'node:fs'

export const file: FSWrapper = {
  write: (path: string, data: Config): void => fs.writeFileSync(path, JSON.stringify(data, null, 2)),
  read: (path: string) => fs.readFileSync(path, 'utf-8'),
  exists: (path: string): boolean => fs.existsSync(path)
}
