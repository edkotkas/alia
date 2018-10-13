const path = require('path')
const fs = require('fs')

const home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE

const configPath = path.join(home, '.alia.json')

const config = require(configPath)

function add(args, cb) {
  if (!args.includes(config.key)) {
    return cb(`
      Invalid Input, missing separator: ${config.key}
    `)
  }

  const [key, cmd] = args.map(arg => arg).join(' ').split(config.key).map(arg => arg.trim())

  readStore((err, cfg) => {
    if (err) {
      return cb(err)
    }

    if (cfg.alias[key]) {
      return cb(`
        Alias already exists for '${key}' as: ${key} ${config.key} ${cfg.alias[key]}
        Remove it first and try again
        Your alias: ${args.join(' ')}
      `)
    } else {
      cfg.alias[key] = cmd

      updateStore(cfg, (err) => {
        if (err) {
          return cb(err)
        }

        cb(null, args.join(' '))

      })
    }
  })
}

function remove(args, cb) {
  const key = args.join(' ').trim()

  if (!key) {
    return cb('Invalid Input')
  }

  readStore((err, cfg) => {
    if (err) {
      return cb(err)
    }

    if (!cfg.alias[key]) {
      return cb(`
        Alias does not exist
        Your alias: ${key}
      `)
    } else {
      delete cfg.alias[key]

      updateStore(cfg, (err) => {
        if (err) {
          return cb(err)
        }

        cb(null, args.join(' '))
      })
    }
  })
}

function readStore(cb) {
    fs.readFile(configPath, (err, data) => {
      if (err) {
        cb('Could note find Alia file')
      }

      cb(null, JSON.parse(data))
    })
}

function updateStore(data, cb) {
  fs.writeFile(configPath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      return cb(`
        Failed to update Alia file
      `)
    }

    cb()
  })
}


module.exports = {add, remove}