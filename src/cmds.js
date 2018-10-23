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

    let c = arr.slice(0, arr.length - (index - 1)).join(' ')
    if (alias[c]) {
      return alias[c].concat(args.slice(index).filter(arg => c.indexOf(arg) === -1))
    } else {
      return ''
    }
  }, '')

  if (command) {
    spawn(command.shift(), command, options)
  } else {
    console.error(`
      No alias found for: ${command.join(' ')}
    `)
  }
}
