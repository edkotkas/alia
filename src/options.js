const alias = require('./alia')

const flags = [
  {
    keys: ['version', 'v'],
    option: alias.version
  },
  {
    keys: ['help', 'h'],
    option: alias.help
  },
  {
    keys: ['set', 's', 'sh'],
    option: alias.set
  },
  {
    keys: ['remove', 'r'],
    option: alias.remove
  },
  {
    keys: ['list', 'l', 'la'],
    option: alias.list
  },
  {
    keys: ['conf', 'c', 'cs', 'ct', 'cg'],
    option: alias.conf
  },
  {
    keys: ['sync', 'sy', 'syp', 'syu'],
    option: alias.sync
  }
]

function options(args) {
  if (!args[0]) {
    alias.help()
    return true
  }

  if (!args[0].startsWith('-')) {
    return false
  }

  const arg = args[0].split('-').join('')
  const flag = flags.find(flag => flag.keys.find(key => key === arg))

  if (!flag) {
    console.error(`
      No option: ${args[0]}
    `)
  } else {
    flag.option(args)
  }

  return true
}

module.exports = {
  flags,
  options
}
