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
        
        --add, -a         add alias
            -x            enable experimental shell
        --remove, -r      remove alias
        --list, -l        list available alias
        
        --conf, -c        change alia configuration
          separator [string]                set alias separator (default: @)   
          token <your github api token>     set the api token for gist sync
          gist <your gist id>               set the gist id to use for sync
          
        --sync, -s        backup/restore your config (default: restore)
          push    backup your current config
          pull    restore config from gist

      Examples
      
        $ al -a gp ${separator} git push
          > Added: gp ${separator} git push
          
        $ al gp
          > git push
          
        $ al -r gp
          > Removed: gp
  `)
}

function add(args) {
  const experimental = args[0] === '-x'

  let separatorIndex = args.indexOf(config.options.separator)
  if (separatorIndex === -1) {
    console.error(`Invalid Input, missing separator: '${config.options.separator}'`)
    return 1
  }

  const key = args.slice(experimental ? 1 : 0, separatorIndex).join(' ')
  const cmd = args.slice(separatorIndex + 1)

  if (config.alias[key]) {
    console.error(`Alias '${key}' already exists - remove and try again`)
    return 1
  } else {
    if (experimental) {
      console.log(`
        Warning: Adding experimental feature (potentially insecure), use at your own discretion!
      `)

      cmd.unshift('EXPERIMENTAL')
    }

    config.alias[key] = cmd

    write()
  }

  console.log(`Added alias: ${key} ${config.options.separator} ${cmd.join(' ')}`)
  return 0
}

function remove(args) {
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
  return Object.keys(alias).map(key => `${key} \t${config.options.separator} \t${alias[key].join(' ')}`)
}

function list() {
  console.log(mapList(config.alias).join('\n'))
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

function sync(args) {
  const err = `
    Invalid input.

    Valid options:
      push    backup your current config
      pull    restore config from gist
  `

  const ops = {
    push: gistPush,
    pull: gistPull
  }

  if (!args || args.length !== 1) {
    return ops.pull()
  }

  let op = ops[args[0]]

  if (!op) {
    return console.err(err)
  }

  op()
}

function conf(args) {
  const err = `
    Invalid input.
  
    Valid options:
      separator [string]                set alias separator (default: @)   
      token <your github api token>     set the api token for gist sync
      gist <your gist id>               set the gist id to use for sync
  `

  const ops = {
    separator: arg => setSeparator(arg),
    token: (token) => {
      if (token) {
        config.options.sync.apiToken = token
        write()
      }
    },
    gist: (id) => {
      if (id) {
        config.options.sync.gistId = id
        write()
      }
    }
  }

  if (!args || args.length < 1) {
    return console.error(err)
  }

  let op = ops[args[0]]

  if (!op) {
    return console.error(err)
  }

  op(args[1])
}

module.exports = {add, remove, list, help, version, sync, conf}