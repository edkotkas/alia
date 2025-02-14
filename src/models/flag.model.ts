export type FlagData = Record<string, string[]>

export interface FlagInfo {
  key: string
  short: string
  desc: string
  run?: Action
  mods?: FlagInfo[]
  format?: RegExp
  usage?: string
  noConf?: boolean
}

export interface ModData {
  value: string
  args: string[]
}

export type Action = (args: string[], data?: FlagData) => boolean | Promise<boolean>

export interface ActionParams {
  args: string[]
  data?: ActionData
  mods?: FlagMods
}

export type ActionData = Record<string, string[] | undefined>

export type FlagMods = Record<string, string>
