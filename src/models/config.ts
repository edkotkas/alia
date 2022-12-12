export interface Config {
  version: number
  options: Options
  alias: Alias,
  meta: MetaData
}

export interface MetaData {
  gist: Gist
}

export interface Gist {
  token: string
  id: string
}

export interface Options {
  separator: string
}

export interface AliasOptions {
  shell: boolean
}

export type Alias = Record<string, Command>

export interface Command {
  options: AliasOptions
  command: string[]
}