import type { Config } from './config.model.js'

export interface FSWrapper {
  read: (path: string) => string
  write: (path: string, data: Config) => void
  exists: (path: string) => boolean
}

export interface PackageJson {
  version: string
}
