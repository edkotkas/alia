const { spawn } = require('child_process')
const config  = require('./config')

const options = {
  stdio: 'inherit',
  shell: true
}

module.exports = function(args) {
  const { alias } = config.config

  let projectAlias

  if (config.projectConfig) {
    projectAlias = config.projectConfig.alias
  }

  const command = args.reduce((acc, val, index, arr) => {
    return projectAlias && getCommand(projectAlias, args, acc, index, arr)
      || getCommand(alias, args, acc, index, arr)
  }, '')

  if (command) {
    spawn(command.shift(), command, options)
  } else {
    console.error(`
      Failed to parse alias from: ${args.join(' ')}
    `)
  }
}

function getCommand(alias, args, acc, index, arr) {
  if (acc) return acc

  const cmd = arr.slice(0, arr.length - index).join(' ')
  if (alias[cmd]) {
    const extraParameters = args
      .slice(arr.length - index)

    return alias[cmd].concat(extraParameters)
  } else {
    return ''
  }
}
