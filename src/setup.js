const path = require('path')
const fs = require('fs')

const home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE

const configPath = path.join(home, '.alia.json')

module.exports.run = function (cb) {
  fs.stat(configPath, (err) => {
    if (err && err.code === 'ENOENT') {
      fs.writeFile(configPath, JSON.stringify(require('../config'), null, 2), (err) => {
        if (err) {
          return console.error(err)
        }

        console.log(`
          Generated default alia config
          Type 'al' to view help
        `)

        cb()
      })
    } else {
      cb()
    }
  })
}