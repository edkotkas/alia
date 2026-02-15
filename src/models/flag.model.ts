export interface FlagInfo {
  key: string
  short: string
  desc: string
  run?: Action
  mods?: FlagInfo[]
  format?: RegExp
  usage?: string
  required?: boolean
}

export type Action = (args: string[], data: ActionData, flag?: FlagInfo) => boolean | Promise<boolean>

export type ActionData = Record<string, string[]>
