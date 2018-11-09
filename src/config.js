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
    write()
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

function write(proj = false) {
  config.aliaVersion = project.version

  if (proj) {
    fs.writeFileSync(projectConfigPath, JSON.stringify(projectConfig, null, 2))
  } else {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
  }
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
      return console.error(err)
    }

    gistConfig.options.sync.apiToken = config.options.sync.apiToken
    config = gistConfig

    write()
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

function createProject() {
  fs.writeFileSync(projectConfigPath, JSON.stringify(defaultConfig, null, 2))
  console.log('Created project config in:', projectConfigPath)
}

module.exports.options = {conf, sync, createProject}
module.exports.config = config
module.exports.projectConfig = projectConfig
module.exports.write = write
