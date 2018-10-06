const path = require('path')
const fs = require('fs')

const global = path.join(__dirname, '..', 'alia.json')

const separator = `~`

module.exports.add = function(args, cb) {
  if (!args.includes(separator)) {
    return cb(`
      Invalid Input, missing separator: ~
    `)
  }

  const [key, cmd] = args.map(arg => arg).join(' ').split(separator).map(arg => arg.trim())

  readStore((err, alia) => {
    if (err) {
      return cb(err)
    }

    if (alia[key]) {
      return cb(`
        Alias already exists for '${key}' as: ${key} ${separator} ${alia[key]}
        Remove it first and try again
        Your alias: ${args.join(' ')}
      `)
    } else {
      alia[key] = cmd

      updateStore(alia, (err) => {
        if (err) {
          return cb(err)
        }

        cb(null, args.join(' '))

      })
    }
  })
}

module.exports.remove = function(args, cb) {
  const key = args.join(' ').trim()

  if (!key) {
    return cb('Invalid Input')
  }

  readStore((err, alia) => {
    if (err) {
      return cb(err)
    }

    if (!alia[key]) {
      return cb(`
        Alias does not exist
        Your alias: ${key}
      `)
    } else {
      delete alia[key]

      updateStore(alia, (err) => {
        if (err) {
          return cb(err)
        }

        cb(null, args.join(' '))
      })
    }
  })
}

function readStore(cb) {
    fs.readFile(global, (err, data) => {
      if (err) {
        cb('Could note find Alia file')
      }

      cb(null, JSON.parse(data))
    })
}

function updateStore(data, cb) {
  fs.writeFile(global, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      return cb(`
        Failed to update Alia file
      `)
    }

    cb()
  })
}