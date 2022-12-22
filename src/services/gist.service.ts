import https from 'node:https'
import type { Config, GistResponse, MetaData } from '../models'
import type { ConfigService } from './index.js'

import { Log } from '../logger.js'

export class GistService {

  constructor(
    private configService: ConfigService
  ) {
  }

  private baseUrl = `https://api.github.com/gists/`

  private async request(url: string, options: https.RequestOptions, data?: Config): Promise<GistResponse> {
    return new Promise((resolve, reject) => {
      const hr = https.request(url, options, res => {
        if (res.statusCode !== 200) {
          return reject(new Error(res.statusMessage))
        }

        res.setEncoding('utf8')
        const body: string[] = []

        res.on('data', (data: string) => body.push(data))
        res.on('end', () => resolve(JSON.parse(body.join('')) as GistResponse))
      }).on('error', err => reject(err))

      if (data ?? false) {
        hr.write(JSON.stringify({
          description: 'Alia Config',
          files: {
            [this.configService.fileName]: {
              content: JSON.stringify(data, null, 2)
            }
          }
        }))
      }

      hr.end()
    })
  }

  public async pull(): Promise<void> {
    Log.info('Pulling config from Gist...')

    const gistId = this.configService.getGistId()
    let data = {} as GistResponse

    try {
      data = await this.request(`${this.baseUrl}${gistId}`, {
        method: 'GET',
        headers: { 'User-Agent': 'nodejs' }
      })
    } catch(e) {
      throw e
    }

    const { updated_at, files } = data

    Log.info(`Fetched: ${updated_at}`)

    const gistFile = files[this.configService.fileName]
    if (!gistFile) {
      throw new Error(`Gist must contain a file named '${this.configService.fileName}'`)
    }

    try {
      const aliaConfig = JSON.parse(gistFile.content) as Config

      aliaConfig.meta = this.configService.getMetaData()

      this.configService.save(aliaConfig)

      Log.info('...Done:', this.configService.filePath)
    } catch (e) {
      throw e
    }
  }

  public async push(): Promise<void> {
    Log.info('Pushing local config to Gist...')
      const gistId = this.configService.getGistId()
      const token = this.configService.getToken()

      const config = this.configService.config
      config.meta = {} as MetaData
    try {
      const { html_url } = await this.request(`${this.baseUrl}${gistId}`, {
        method: 'PATCH',
        headers: {
          'User-Agent': 'nodejs',
          Authorization: `token ${token}`
        }
      }, config)

      Log.info('...Done:', html_url)
    } catch (e) {
      throw e
    }
  }
}
