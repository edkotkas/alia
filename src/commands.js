const { spawnSync } = require('child_process')
const config  = require('./config')

const options = {
  stdio: 'inherit'
}

module.exports = function(args) {
  const { alias } = config.config

  let projectAlias

  if (config.projectConfig) {
    projectAlias = config.projectConfig.alias
  }

  const command = args.reduce((acc, val, index, arr) => {
    if (acc) return acc

    const cmd = arr.slice(0, arr.length - index).join(' ')
    let al = projectAlias && projectAlias[cmd] || alias[cmd]
    if (al) {
      const extraParameters = args
        .slice(arr.length - index)

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
