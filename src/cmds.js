const { spawn } = require('child_process')
const config  = require('./config')

const options = {
  stdio: 'inherit',
  shell: true
}

module.exports = function(args) {
  const { alias } = config.config

  const command = args.reduce((acc, val, index, arr) => {
    if (acc) return acc

    const cmd = arr.slice(0, arr.length - index).join(' ')
    if (alias[cmd]) {
      const extraParameters = args
        .slice(index)
        .filter(arg => cmd.indexOf(arg) === -1)

      return alias[cmd].concat(extraParameters)
    } else {
      return ''
    }
  }, '')

  if (command) {
    spawn(command.shift(), command, options)
  } else {
    console.error(`
      Failed to parse alias from: ${args.join(' ')}
    `)
  }
}
