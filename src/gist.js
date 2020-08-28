const ax = require('axios')

const aliaGistFilename = 'alia.json'
const apiUrl = `https://api.github.com/gists/`

function pull (config, callback) {
  const gistId = config.options.sync.gistId

  ax.get(
    `${apiUrl}${gistId}`,
    {headers: {
        'User-Agent': 'nodejs'
      }}
  ).then(res => {
    const { updated_at, files } = res.data
    console.log(`Fetched: ${updated_at}`)

    const aliaFile = files[aliaGistFilename]
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
  }).catch(err => {
    const {status, statusText} = err.response
    callback(`Error pulling gist: ${status} - ${statusText}`)
  })
}

function push (config, callback) {
  const gistId = config.options.sync.gistId
  const auth = config.options.sync.apiToken
  // Mask API token
  config.options.sync.apiToken = '########################################'

  ax.patch(
    `${apiUrl}${gistId}`,
    {
      description: 'alia config',
      files: {
        [aliaGistFilename]: {
          content: JSON.stringify(config, null, 2)
        }
      }
    },
    {headers: {
        'User-Agent': 'nodejs',
        Authorization: `token ${auth}`
      }}
  ).then(res => {
    return callback(null, res.data.html_url)
  }).catch(err => {
    const {status, statusText} = err.response
    console.log(`Error pushing gist: ${status} - ${statusText}`)
  })
}

module.exports = {pull, push}
