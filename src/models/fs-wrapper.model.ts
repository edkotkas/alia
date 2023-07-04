import type { Config } from './config.model'

export interface FSWrapper {
  read: (path: string) => string
  write: (path: string, data: Config) => void,
  exists: (path: string) => boolean
}
