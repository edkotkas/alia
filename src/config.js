const path = require('path')
const fs = require('fs')
const homedir = require('os').homedir()

const gist = require('./gist')
const project = require('../package')
const defaultConfig = require('./defaultConfig')
defaultConfig.aliaVersion = project.version

const aliaFileName = '.alia.json'

let config = defaultConfig
const configPath = path.join(homedir, aliaFileName)

try {
  config = require(configPath)
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.log(`Creating default config in ${configPath}`)
    writeConfig()
  } else {
    console.error('Error reading config', err)
  }
}

const currentDir = process.cwd()
const projectConfigPath = path.join(currentDir, aliaFileName)

let projectConfig

if (projectConfigPath !== configPath) {
  try {
    projectConfig = require(projectConfigPath)
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      console.error('Error reading project config', err)
    }
  }
}

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
        
        --add, -a         add alias (add -p for project alias)
        --remove, -r      remove alias (add -p for project alias)
        --project, -p     create project alia config
        --list, -l        list available alias
        --separator, -s   change the separator (default: @)
        --restore, -r     restore your config
        --backup, -b      backup your config
   
      Examples
      
        $ al -a gp ${separator} git push
          > Added: gp ${separator} git push
          
        $ al gp
          > git push
          
        $ al -r gp
          > Removed: gp
  `)
}

function writeConfig(proj = false) {
  config.aliaVersion = project.version

  if (proj) {
    fs.writeFileSync(projectConfigPath, JSON.stringify(projectConfig, null, 2))
  } else {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
  }
}

function addAlias(args) {
  const project = args[0] === '-p'
  let separatorIndex = args.indexOf(config.options.separator)
  if (separatorIndex === -1) {
    console.error(`Invalid Input, missing separator: '${config.options.separator}'`)
    return 1
  }

  const key = args.slice(project ? 1 : 0, separatorIndex).join(' ')
  const cmd = args.slice(separatorIndex + config.options.separator.length - 1)

  if (project) {
    if (projectConfig.alias[key]) {
      console.error(`Alias '${key}' already exists - remove and try again`)
      return 1
    } else {
      projectConfig.alias[key] = cmd
      writeConfig(true)
    }
  } else {
    if (config.alias[key]) {
      console.error(`Alias '${key}' already exists - remove and try again`)
      return 1
    } else {
      config.alias[key] = cmd
      writeConfig()
    }
  }


  console.log(`Added alias: ${key} ${config.options.separator} ${cmd.join(' ')}`)
  return 0
}

function removeAlias(args) {
  const project = args[0] === '-p'
  const key = project ? args.slice(1) : args.join(' ').trim()

  if (!key) {
    console.error('No alias specified')
    return 1
  }
  if (project) {
    if (!projectConfig.alias[key]) {
      console.error(`Alias '${key}' does not exist`)
      return 1
    } else {
      delete projectConfig.alias[key]
      writeConfig(true)
    }
  } else {
    if (!config.alias[key]) {
      console.error(`Alias '${key}' does not exist`)
      return 1
    } else {
      delete config.alias[key]
      writeConfig()
    }
  }

  console.log(`Removed alias: ${key}`)
  return 0
}

function mapList(alias) {
  return Object.keys(alias).map(key => `${key} \t${config.options.separator} \t${alias[key].join(' ')}`)
}

function list() {
  let alias = ['Global', ...mapList(config.alias)]

  if (projectConfig && projectConfig.alias[0]) {
    const projectAlias = mapList(projectConfig.alias)
    alias.push('\nProject', ...projectAlias)
  }

  console.log(alias.join('\n'))
}

function setSeparator(args) {
  let separator = args.join(' ')
  config.options.separator = separator
    ? separator
    : defaultConfig.options.separator

  writeConfig()
  console.log(`Set the separator to:`, config.options.separator)
}

function gistPull() {
  console.log('Pulling config from gist...')

  gist.pull(config, (err, gistConfig) => {
    if (err) {
      return console.error(err)
    }

    gistConfig.options.sync.apiToken = config.options.sync.apiToken
    config = gistConfig

    writeConfig()
    console.log(`...written config to ${configPath}`)
  })
}

function gistPush() {
  console.log('Pushing local config to gist...')

  gist.push(config, (err, gistUrl) => {
    if (err) {
      return console.error(err)
    }

    console.log(`...Done: ${gistUrl}`)
  })
}

function sync(args) {
  const err = `
    Invalid input.

    Valid options:
      push    -   backup your current config
      pull    -   restore config from gist
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
      separator [string]                -   set alias separator (default: @)   
      token <your github api token>     -   set the api token for gist sync
      gist <your gist id>               -   set the gist id to use for sync
  `

  const ops = {
    separator: setSeparator,
    token: (token) => {
      config.options.sync.apiToken = token
      writeConfig()
    },
    gist: (id) => {
      config.options.sync.gistId = id
      writeConfig()
    }
  }

  if (!args || args.length !== 2) {
    return console.error(err)
  }

  let path = args[0].split('.')

  let op = ops[path]

  if (!op) {
    console.log(args)
    return console.error(err)
  }

  op(args[1])
}

function createProject() {
  fs.writeFileSync(projectConfigPath, JSON.stringify(defaultConfig, null, 2))
  console.log('Created project config in:', projectConfigPath)
}

module.exports.alias = {addAlias, removeAlias, createProject, list, help, version}
module.exports.options = {conf, sync}
module.exports.config = config
module.exports.projectConfig = projectConfig
