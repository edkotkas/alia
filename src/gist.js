const request = require('request')

const aliaGistFilename = 'alia.json'

function pull (config, callback) {
  request.get({
    url: `https://api.github.com/gists/${config.options.sync.gistId}`,
    headers: {
      'User-Agent': 'nodejs'
    }
  }, function (err, res, body) {
    if (err) {
      return callback(`Error getting gist ${config.options.sync.gistId}`)
    }

    const aliaFile = JSON.parse(body).files[aliaGistFilename]
    if (!aliaFile){
      return callback(`Error: Gist must contain a file named ${aliaGistFilename}`)
    }

    let aliaJson = {}
    try {
      aliaJson = JSON.parse(aliaFile.content)
    } catch (err) {
      return callback(`Error: ${aliaGistFilename} is not valid JSON`)
    }

    return callback(null, aliaJson)
  })
}

function push (config, callback) {
  callback('Error: Not implemented')
}

module.exports.pull = pull
module.exports.push = push

// // ================================================================
// // test stuff
// // TODO: remove this before merge
// const getConfig = require('./config.js').getConfig
// pull(getConfig(), function (err, config) {
//   if (err) {
//     return console.error(err)
//   }
//   console.log('gist config :', config)
// })

