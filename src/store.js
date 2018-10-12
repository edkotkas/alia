const path = require('path')
const fs = require('fs')
const homedir = require('os').homedir()

const defaultConfig = require('./defaultConfig')
let config = defaultConfig

const configPath = path.join(homedir, '.alia.json')

function writeConfig() {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
}

try {
  // Read config
  config = require(configPath)
} catch (err) {
  // Write config if require fails
  writeConfig()
}

function addAlias(args) {
  if (!args.includes(config.options.separator)) {
    console.error(`Invalid Input, missing separator: '${config.options.separator}'`)
    return 1
  }

  const [key, cmd] = args.map(arg => arg).join(' ').split(config.options.separator).map(arg => arg.trim())

  if (config.alias[key]) {
    console.error(`alias ${key} already exists - remove and try again`)
    return 1
  } else {
    config.alias[key] = cmd
  }

  console.log(`added alias: ${key} ${config.options.separator} ${cmd}`)
  return 0
}

function removeAlias(args) {
  const key = args.join(' ').trim()

  if (!key) {
    console.err('No alias specified')
    return 1
  }

  if (!config.alias[key]) {
    console.error(`alias '${key}' does not exist`)
    return 1
  } else {
    delete config.alias[key]
  }

  console.log(`removed alias: ${key}`)
  return 0
}

module.exports.alias = {
  'add': addAlias,
  'remove': removeAlias
}
module.exports.config = config
module.exports.writeConfig = writeConfig
