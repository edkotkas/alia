const path = require('path')
const fs = require('fs')
const homedir = require('os').homedir()

const project = require('../package')
const defaultConfig = require('./defaultConfig')
defaultConfig.aliaVersion = project.version

let aliaFileName = '.alia.json'
if (process.env.NODE_ENV === 'test') {
  aliaFileName = '.alia_test.json'
}

const configPath = path.join(homedir, aliaFileName)

let config
if (fs.existsSync(configPath)) {
  config = require(configPath)
} else {
  write()
  console.log('Creating default config in ', configPath)
}

function write(conf = null) {
  config = conf || config || defaultConfig

  config.aliaVersion = config.aliaVersion || project.version

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
}

module.exports = {config, write, configPath, defaultConfig}
