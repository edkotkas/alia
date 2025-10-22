import type { FSWrapper } from '../models/fs-wrapper.model.js'
import type { Config } from '../models/config.model.js'

import * as fs from 'node:fs'

export const file: FSWrapper = {
  write: (path: string, data: Config): void => {
    fs.writeFileSync(path, JSON.stringify(data, null, 2))
  },
  read: (path: string): string => fs.readFileSync(path, 'utf-8'),
  exists: (path: string): boolean => fs.existsSync(path)
}
