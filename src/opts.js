const { alias, options } = require('./config')

const flags = [
  ['--version, -v', alias.version],
  ['--help, -h', alias.help],
  ['--add, -a', alias.addAlias],
  ['--project, -p', alias.createProject],
  ['--remove, -r', alias.removeAlias],
  ['--list, -l', alias.list],
  ['--separator, -s', options.setSeparator],
  ['--restore, -r', options.gistPull],
  ['--backup, -b', options.gistPush]
]

module.exports = function(args) {
  if (!args[0]) {
    alias.help()
    return true
  }

  if (!args[0].startsWith('-')) {
    return false
  }

  const flag = flags.find(([option]) => option.split(', ').includes(args[0]))

  if (!flag) {
    console.log(`
      No option: ${args[0]}
    `)
    return true
  }

  const [option, action] = flag

  if (option) {
    action(args.slice(1))
    return true
  }

  return false
}
