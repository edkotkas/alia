import type { ActionParameters, Alias, Flag, ListModifiers } from '../models'
import type { ConfigService } from '../services'
import Log from '../logger.js'

function mapList(alias: Alias, config: ConfigService): string[] {
  return Object.keys(alias)
    .map(key => `${key} \t${config.getSeparator()} \t${alias[key].command.join(' ')}`)
}

export const ListFlag = {
  key: 'list',
  short: 'l',
  description: 'list available alias',
  modifiers: [
    {
      key: 'sort',
      description: 'sort alphabetically'
    },
    {
      key: 'raw',
      description: 'list raw alias info'
    },
    {
      key: 'filter',
      format: /^\w+/,
      description: 'filter alias list'
    }
  ],
  action: function list({ modifiers, data }: ActionParameters<ListModifiers>, config: ConfigService): void {
    let alias = config.config.alias
    let aliaKeys = Object.keys(alias)

    if (modifiers.filter) {
      const filters = (data.filter ?? []) as string[]
      if (filters.length === 0) {
        throw new Error('No filter provided')
      }

      aliaKeys = aliaKeys.filter(a => filters.includes(a))
    }

    if (modifiers.sort) {
      aliaKeys = aliaKeys.sort()
    }

    alias = aliaKeys.reduce<Alias>((acc, val) => {
      acc[val] = alias[val]
      return acc
    }, {})

    if (modifiers.raw) {
      return Log.info(JSON.stringify(alias, null, 2))
    }

    Log.info((mapList(alias, config)).join('\n'))
  }
} as Flag
