import type { FlagInfo } from '../models/flag.model.js'

import { Flag } from './flag.js'

export class HelpFlag extends Flag {
  flag: FlagInfo = {
    key: 'help',
    short: 'h',
    desc: 'show help'
  }
}
