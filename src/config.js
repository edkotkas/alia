const path = require('path')
const fs = require('fs')
const homedir = require('os').homedir()

const defaultConfig = require('./defaultConfig')
defaultConfig.version = 2

let aliaFileName = '.alia.json'
if (process.env.NODE_ENV === 'test') {
  aliaFileName = '.alia_test.json'
}

const configPath = path.join(homedir, aliaFileName)

let config
if (fs.existsSync(configPath)) {
  config = require(configPath)
  applyMigrations()
} else {
  write()
  console.log('Creating default config in ', configPath)
}

function applyMigrations() {
  let updateTo = undefined

  if (!config.version || config.version < 2) {
    delete config.aliaVersion
    Object.keys(config.alias)
      .filter(key => !config.alias[key].command)
      .forEach(key => {
        const alias = config.alias[key]
        const options = {}

        if (alias[0] === 'EXPERIMENTAL') {
          options.shell = true
          alias.shift()
        }

        config.alias[key] = {
          options,
          command: alias
        }
      })

    updateTo = 2
  }

  if (config.version === 2) {
    delete config.aliaVersion
    const keysToBeUpdated = Object.keys(config.alias)
      .filter(key => {
        const cmd = config.alias[key].command.toString()
        return !config.options.shell
          && !config.alias[key].command[1]
          && (cmd.includes('-') || cmd.includes('&') || cmd.includes('|'))
      })

    if (keysToBeUpdated.length > 0) {
      keysToBeUpdated.forEach(key => {
        const alias = config.alias[key]
        alias.options.shell = true
        alias.command = alias.command[0].split(' ')
      })

      updateTo = 2.1
    }
  }

  if (updateTo) {
    config.version = updateTo
    write()
    console.log(`Migrated config to: ${updateTo}`)
  }
}

function write(conf = null) {
  config = conf || config || defaultConfig
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
}

module.exports = {config, write, configPath, defaultConfig}
