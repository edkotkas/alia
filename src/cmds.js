const { alias } = require('./config').config
const { spawn } = require('child_process')

module.exports = function(args) {
  let cmd = args.join(' ')
  for (const _ in args) {
    if (alias[cmd]) {
      const command = args.join(' ').replace(cmd, alias[cmd])

      if (!command) {
        console.error(`
          No alias found for: ${cmd}
        `)
      } else {
        const [ps, ...opts] = command.split(' ')
        const process = spawn(ps, opts)

        process.stdout.on('data', data => {
          console.log(data.toString())
        })

        process.stderr.on('data', data => {
          console.log(data.toString())
        })
      }

      break
    }

    let t = cmd.split(' ')
    cmd = t.slice(0, t.length - 1).join(' ')
  }
}
