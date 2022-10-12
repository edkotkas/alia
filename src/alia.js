const project = require('../package')
const gist = require('./gist')
const {config, write, configPath, defaultConfig} = require('./config')

function version() {
  console.log(project.version)
}

function help() {
  const separator = config.options.separator
  console.log(`
      Usage
      
        $ al [options] [alias] [${separator}] [command]
   
      Options
      
        --version, -v     show version
        --help, -h        show this

        --set, -s[h]      set alias (with 'h' for 'shell' option) 

        --remove, -r      remove alias
        
        --list, -l        list available alias
        
        --conf, -c        change alia configuration
          separator [string]                set alias separator (default: @)   
          token <your github api token>     set the api token for gist sync
          gist <your gist id>               set the gist id to use for sync
          
        --sync, -sy        backup/restore your config (default: restore)
          push             backup your current config
          pull             restore config from gist

      Examples
      
        $ al -s gp ${separator} git push
          > Added: gp ${separator} git push
          
        $ al gp
          > git push
          
        $ al -r gp
          > Removed: gp
  `)
}

function set([ cmd, ...args ]) {
  let separatorIndex = args.indexOf(config.options.separator)
  if (separatorIndex === -1) {
    console.error(`Invalid Input, missing separator: '${config.options.separator}'`)
    return 1
  }

  const shell = args[0] === '-sh'
  if (shell) {
    args.shift()
    separatorIndex--
  }

  const key = args.slice(0, separatorIndex).join(' ')
  let command = args.slice(separatorIndex + 1)

  if (!key && !command) {
    console.error(`
      Error: 'key' or 'command' not provided.
    `)

    return 1
  }

  if (command.length === 1) {
    command = command[0].split(' ')
  }

  if (config.alias[key]) {
    console.log(`Unset alias: ${key} ${config.options.separator} ${config.alias[key].command.join(' ')}`)
  }

  config.alias[key] = {
    options: {
      shell: shell || cmd === '-sh'
    },
    command
  }

  write()

  console.log(`Set alias: ${key} ${config.options.separator} ${command.join(' ')}`)
  return 0
}

function remove([_, ...args]) {
  const key = args.join(' ').trim()

  if (!key) {
    console.error('No alias specified')
    return 1
  }

  if (!config.alias[key]) {
    console.error(`Alias '${key}' does not exist`)
    return 1
  } else {
    delete config.alias[key]
    write()
  }

  console.log(`Removed alias: ${key}`)
  return 0
}

function mapList(alias) {
  return Object.keys(alias).map(key => `${key} \t${config.options.separator} \t${alias[key].command.join(' ')}`)
}

function list([cmd, ...args]) {
  const l = mapList(config.alias)

  console.log(
    (cmd === '-la' || args[0] === '-a' ? l.sort() : l).join('\n')
  )
}

function setSeparator(separator) {
  config.options.separator = separator
    ? separator
    : defaultConfig.options.separator

  write()
  console.log(`Set the separator to:`, config.options.separator)
}

function gistPull() {
  console.log('Pulling config from gist...')

  gist.pull(config, (err, gistConfig) => {
    if (err) {
      return console.error('Failed to pull:', err)
    }

    gistConfig.options.sync.apiToken = config.options.sync.apiToken

    write(gistConfig)

    console.log('...Done:', configPath)
  })
}

function gistPush() {
  console.log('Pushing local config to gist...')

  gist.push(config, (err, gistUrl) => {
    if (err) {
      return console.error('Failed to push:', err)
    }

    console.log('...Done:', gistUrl)
  })
}

function sync([cmd, ...args]) {
  const err = `
    Invalid input.

    Valid options:
      push    backup your current config
      pull    restore config from gist
  `

  const ops = {
    push: gistPush,
    pull: gistPull,
    '-syp': gistPush,
    '-syu': gistPull,
    '-sy': gistPull,
    '--sync': gistPull
  }

  if (!cmd) {
    return ops.pull()
  }

  let op = ops[args[0]] || ops[cmd]

  if (!op) {
    return console.err(err)
  }

  op(ops[cmd] ? args[0] : args[1])
}

function conf([cmd, ...args]) {
  const setToken = (token) => {
      if (token) {
        config.options.sync.apiToken = token
        write()
      }
  }

  const setGist = (id) => {
    if (id) {
      config.options.sync.gistId = id
      write()
    }
  }

  const ops = {
    separator: setSeparator,
    token: setToken,
    gist: setGist,
    '-cs': setSeparator,
    '-ct': setToken,
    '-cg': setGist
  }

  if (!cmd) {
    return console.error(`
      No argument provided.
      Available: ${Object.keys(ops).join(', ')}
    `)
  }

  const op = ops[args[0]] || ops[cmd]

  if (!op) {
    return console.error(`
      Invalid argument: ${args[0]}
      Available: ${Object.keys(ops).join(', ')}
    `)
  }

  op(ops[cmd] ? args[0] : args[1])
}

module.exports = {set, remove, list, help, version, sync, conf}
