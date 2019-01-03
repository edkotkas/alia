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
      return callback(`Error pulling gist ${config.options.sync.gistId}`)
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
  const auth = config.options.sync.apiToken
  // Mask API token
  config.options.sync.apiToken = '########################################'

  request.patch({
    url: `https://api.github.com/gists/${config.options.sync.gistId}`,
    headers: {
      'User-Agent': 'nodejs',
      Authorization: `token ${auth}`
    },
    json: {
      description: 'alia config',
      files: {
        [aliaGistFilename]: {
          content: JSON.stringify(config, null, 2)
        }
      }
    }
  }, function (err, res, body) {
    if (err) {
      return callback(`Error pushing gist ${config.options.sync.gistId}`)
    }

    return callback(null, body.html_url)
  })

}

module.exports = {pull, push}
