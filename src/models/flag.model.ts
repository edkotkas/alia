import type { ConfigService, GistService } from '../services'

export interface Flag {
  key: string
  short?: string
  description?: string
  usage?: string
  modifiers?: ModifierData[]
  action: Action
}

export type Action<T = FlagModifiers> = (params: ActionParameters<T>, config: ConfigService, gist: GistService) => void | Promise<void> 

export interface ActionParameters<T = FlagModifiers> {
  args: string[]
  data: ActionData<T>
  modifiers: T
}

export type ActionData<T> = {
  [key in keyof T]?: string | string[] | boolean
}

export type FlagModifier = keyof ConfModifiers | keyof SyncModifiers | keyof SetModifiers | keyof ListModifiers
export type FlagModifiers = {
  [key in FlagModifier]?: string
}

export interface ConfModifiers {
  separator?: string
  token?: string
  gist?: string
  path?: string
  shell?: string
  verbose?: string
}

export interface SyncModifiers {
  push?: string
  pull?: string
}

export interface SetModifiers {
  shell?: string
  env?: string
}

export interface ListModifiers {
  sort?: string
  raw?: string
  filter?: string
}

export interface ModifierData {
  key: keyof FlagModifiers,
  format?: RegExp,
  description?: string
}
