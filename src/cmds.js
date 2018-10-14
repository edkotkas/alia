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
        const process = spawn(ps, opts)

        process.stdout.on('data', data => console.log(data.toString()))
        process.stderr.on('data', data => console.log(data.toString()))
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
