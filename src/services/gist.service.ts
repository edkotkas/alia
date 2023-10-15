import type { MetaData, Config } from '../models/config.model.js'
import type { GistResponse } from '../models/gist-response.model.js'
import type { ConfigService } from './config.service.js'

import https from 'node:https'
import logger from '../logger.js'

export class GistService {
  constructor(private configService: ConfigService) {}

  private baseUrl = `https://api.github.com/gists/`

  private async request(url: string, options: https.RequestOptions, data?: Config): Promise<GistResponse> {
    return new Promise((resolve, reject) => {
      const hr = https
        .request(url, options, (res) => {
          if (res.statusCode !== 200) {
            return reject(new Error(res.statusMessage))
          }

          res.setEncoding('utf8')
          const body: string[] = []

          res.on('data', (data: string) => body.push(data))
          res.on('end', () => resolve(JSON.parse(body.join('')) as GistResponse))
        })
        .on('error', (err) => reject(err))

      if (data ?? false) {
        hr.write(
          JSON.stringify({
            description: 'Alia Config',
            files: {
              [this.configService.fileName]: {
                content: JSON.stringify(data, null, 2)
              }
            }
          })
        )
      }

      hr.end()
    })
  }

  public async restore(): Promise<void> {
    logger.info('Restore config from Gist...')

    const gistId = this.configService.gistId
    let data = {} as GistResponse

    try {
      data = await this.request(`${this.baseUrl}${gistId}`, {
        method: 'GET',
        headers: { 'User-Agent': 'nodejs' }
      })
    } catch (e) {
      throw e
    }

    const { updated_at, files } = data

    logger.info(`Fetched: ${updated_at}`)

    const gistFile = files[this.configService.fileName]
    if (!gistFile) {
      throw new Error(`Gist must contain a file named '${this.configService.fileName}'`)
    }

    try {
      const aliaConfig = JSON.parse(gistFile.content) as Config

      aliaConfig.meta = this.configService.meta

      this.configService.save(aliaConfig)

      logger.info('...Done:', this.configService.filePath)
    } catch (e) {
      throw e
    }
  }

  public async backup(): Promise<void> {
    logger.info('Backup local config to Gist...')
    const gistId = this.configService.gistId
    const token = this.configService.token

    const config = this.configService.config
    config.meta = {} as MetaData
    try {
      const { html_url } = await this.request(
        `${this.baseUrl}${gistId}`,
        {
          method: 'PATCH',
          headers: {
            'User-Agent': 'nodejs',
            Authorization: `token ${token}`
          }
        },
        config
      )

      logger.info('...Done:', html_url)
    } catch (e) {
      throw e
    }
  }
}
