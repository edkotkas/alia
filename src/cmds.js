const { spawn } = require('child_process')
const config  = require('./config')

const options = {
  stdio: 'inherit',
  shell: true
}

module.exports = function(args) {
  const { alias } = config.config

  const cmd = args.shift()

  const command = alias[cmd]
  if (command) {
    spawn(command.shift(), command.concat(args), options)
  } else {
    console.error(`
      No alias found for: ${args}
    `)
  }
}
