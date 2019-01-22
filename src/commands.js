const { spawnSync } = require('child_process')
const config  = require('./config')

const options = {
  stdio: 'inherit'
}

module.exports = function(args) {
  const { alias } = config.config

  const command = args.reduce((acc, val, index, arr) => {
    if (acc) return acc

    const cmd = arr.slice(0, arr.length - index).join(' ')
    let al = alias[cmd]
    if (al) {
      const extraParameters = args
        .slice(arr.length - index)

      if (al[0] === 'EXPERIMENTAL') {
        al.shift()
        options.shell = true
      }

      return al.concat(extraParameters)
    } else {
      return ''
    }
  }, '')

  if (command) {
    spawnSync(command.shift(), command, options)
  } else {
    console.error(`
      Failed to parse alias from: ${args.join(' ')}
    `)
  }
}
