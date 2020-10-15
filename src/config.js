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
  if (!config.version || config.version < 2) {
    delete config.aliaVersion
    Object.keys(config.alias)
      .filter(key => !config.alias[key].command)
      .map(key => {
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


    config.version = 2
    console.log('Migrating config to version 2')

    write()
  }
}

function write(conf = null) {
  config = conf || config || defaultConfig
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
}

module.exports = {config, write, configPath, defaultConfig}
