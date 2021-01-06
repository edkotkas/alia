const alias = require('./alia')

const flags = [
  ['--version, -v', alias.version],
  ['--help, -h', alias.help],
  ['--set, -s', alias.set],
  ['--remove, -r', alias.remove],
  ['--list, -l', alias.list],
  ['--conf, -c', alias.conf],
  ['--sync, -sy', alias.sync]
]

module.exports = function(args) {
  if (!args[0]) {
    alias.help()
    return 0
  }

  if (!args[0].startsWith('-')) {
    return 1
  }

  const flag = flags.find(([option]) => option.split(', ').includes(args[0]))

  if (!flag) {
    console.log(`
      No option: ${args[0]}
    `)
    return 0
  }

  const [option, action] = flag

  if (option) {
    action(args.slice(1))
    return 0
  }

  return 1
}
