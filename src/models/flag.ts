export interface Flag {
  full: string
  short?: string
  modifiers?: (keyof FlagModifiers)[]
  action: Action
}

export type Action = (params: ActionParameters<FlagModifiers>) => Promise<void>

export interface ActionParameters<T> {
  args: string[]
  data: ActionData<T>
  modifiers: T
}

export type ActionData<T> = {
  [key in keyof T]: string
}

export type FlagModifier = Record<string, string | undefined>;

export interface FlagModifiers extends ConfModifiers, SyncModifiers, SetModifiers, ListModifiers {}

export interface ConfModifiers extends FlagModifier{
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
  sort?: string
}

export interface ListModifiers {
  sort?: string
}
