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
      Alias not set: ${key}
    `)

    return true
  }

  const [command, ...parameters] = al.command.concat(args)

  const proc = spawnSync(command, parameters, {
    ...options,
    shell: al.options.shell
  })

  if (proc.error) {
    console.error(proc.error)
  }
}
