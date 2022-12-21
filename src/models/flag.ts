export interface Flag {
  full: string
  short?: string
  modifiers?: (keyof FlagModifiers | ModifierData)[]
  action: Action
}

export type Action<T = FlagModifiers> = (params: ActionParameters<T>) => Promise<void>

export interface ActionParameters<T = FlagModifiers> {
  args: string[]
  data: ActionData<T>
  modifiers: T
}

export type ActionData<T> = {
  [key in keyof T]: string | string[]
}

export interface FlagModifiers extends ConfModifiers, SyncModifiers, SetModifiers, ListModifiers {}

export interface ConfModifiers {
  separator?: string
  token?: string
  gist?: string
  path?: string
}

export interface SyncModifiers {
  push?: string
  pull?: string
}

export interface SetModifiers {
  shell?: string
  env?: string  | ModifierData
}

export interface ListModifiers {
  sort?: string
}

export interface ModifierData {
  key: keyof FlagModifiers,
  format: RegExp
}
