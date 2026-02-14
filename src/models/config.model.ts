export interface Config {
  version?: number
  options?: Options
  alias?: Alias
  meta?: MetaData
}

export interface MetaData {
  gist?: Gist
}

export interface Gist {
  token?: string
  id?: string
}

export interface Options {
  shell?: boolean
}

export interface AliasOptions {
  workDir?: string
  quote?: boolean
  shell?: boolean
  env?: Record<string, string>
  envFile?: string
}

export type Alias = Record<string, Command>

export interface Command {
  options: AliasOptions
  command: string[]
}
