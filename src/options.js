const { options } = require('./config')
const alias = require('./alia')

const flags = [
  ['--version, -v', alias.version],
  ['--help, -h', alias.help],
  ['--add, -a', alias.add],
  ['--project, -p', options.createProject],
  ['--remove, -r', alias.remove],
  ['--list, -l', alias.list],
  ['--conf, -c', options.conf],
  ['--sync, -s', options.sync]
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
