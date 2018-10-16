const { alias, options } = require('./config')

const flags = [
  ['--version, -v', alias.version],
  ['--help, -h', alias.help],
  ['--add, -a', alias.add],
  ['--remove, -r', alias.remove],
  ['--list, -l', alias.list],
  ['--separator, -s', options.setSeparator]
]

module.exports = function(args) {
  if (!args[0]) {
    alias.help()
    return true
  }

  if (!args[0].startsWith('-')) {
    return false
  }

  let flag = flags.find(([option, _]) => option.split(', ').includes(args[0]))

  if (!flag) {
    console.log(`
      No option: ${args[0]}
    `)
    return false
  }

  const [option, action] = flag

  if (option) {
    action(args.slice(1))
    return true
  }

  return false
}
