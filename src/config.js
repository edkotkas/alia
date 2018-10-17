const path = require('path')
const fs = require('fs')
const homedir = require('os').homedir()

const project = require('../package')
const defaultConfig = require('./defaultConfig')

let config = defaultConfig

const configPath = path.join(homedir, '.alia.json')

function version() {
  console.log(project.version)
}

function help() {
  let separator = config.options.separator
  console.log(`
      Usage
      
        $ al [options] [alias] [${separator}] [command]
   
      Options
      
        --version, -v     show version
        --help, -h        show this
        
        --add, -a         add alias
        --remove, -r      remove alias
        --list, -l        list available alias
        --separator, -s   change the separator (default: @)
   
      Examples
      
        $ al -a gp ${separator} git push
          > Added: gp ${separator} git push
          
        $ al gp
          > git push
          
        $ al -r gp
          > Removed: gp
  `)
}

function loadConfig() {
  try {
    config = require(configPath)
  } catch(err) {
    if(err.toString().includes('Cannot find module')) {
      console.log(`Creating default config in ${configPath}`)
      writeConfig()
    } else {
      console.error('Error reading config', err)
    }
  }
}

function getConfig() {
  return config
}

function writeConfig() {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
}

function addAlias(args) {
  if (!args.includes(config.options.separator)) {
    console.error(`Invalid Input, missing separator: '${config.options.separator}'`)
    return 1
  }

  const [key, cmd] = args.map(arg => arg).join(' ').split(config.options.separator).map(arg => arg.trim())

  if (config.alias[key]) {
    console.error(`Alias '${key}' already exists - remove and try again`)
    return 1
  } else {
    config.alias[key] = cmd
    writeConfig()
  }

  console.log(`Added alias: ${key} ${config.options.separator} ${cmd}`)
  return 0
}

function removeAlias(args) {
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
    writeConfig()
  }

  console.log(`Removed alias: ${key}`)
  return 0
}

function list() {
  const alias = Object.keys(config.alias)
    .map(key => `${key} ${config.options.separator} ${config.alias[key]}`)
    .join('\n')

  console.log(alias)
}

function setSeparator(args) {
  let separator = args.join('')
  config.options.separator = separator
    ? separator
    : defaultConfig.options.separator

  writeConfig()
  console.log(`Set the separator to:`, config.options.separator)
}

loadConfig()

module.exports.alias = { addAlias, removeAlias, list, help, version }
module.exports.options = { setSeparator }
module.exports.getConfig = getConfig
