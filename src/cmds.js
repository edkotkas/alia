const { spawn } = require('child_process')
const config  = require('./config')

module.exports = function(args) {
  const { alias } = config.getConfig()

  let cmd = args.join(' ')
  for (const _ in args) {
    if (alias[cmd]) {
      const command = args.join(' ').replace(cmd, alias[cmd])

      if (command) {
        const [ps, ...opts] = command.split(' ')
        const task = spawn(ps, opts)

        task.stdout.on('data', data => process.stdout.write(data))
        task.stderr.on('data', data => process.stderr.write(data))
      }

      break
    }

    let t = cmd.split(' ')
    cmd = t.slice(0, t.length - 1).join(' ')
  }

  if (!cmd) {
    console.error(`
      No alias found for: ${args}
    `)
  }
}
