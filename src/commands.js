const { spawnSync } = require('child_process')
const { config } = require('./config')

const options = {
  cwd: process.cwd(),
  stdio: 'inherit'
}

module.exports = function (args) {
  const { alias } = config

  const key = args.shift()
  const al = alias[key]

  if (!al) {
    console.error(`
      Alias not set: ${key}}
    `)
  }

  options.shell = al.options.shell

  const [command, ...parameters] = al.command.concat(args)

  spawnSync(command, parameters, options)
}
