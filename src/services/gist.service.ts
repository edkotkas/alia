import type { MetaData, Config } from '../models/config.model.js'
import type { GistResponse } from '../models/gist-response.model.js'
import type { ConfigService } from './config.service.js'

import logger from '../utils/logger.js'
import { request } from '../utils/request.js'

export class GistService {
  constructor(private configService: ConfigService) {}

  public async restore(): Promise<void> {
    logger.info('restore config from gist...')

    const gistId = this.configService.gistId
    let data = {} as GistResponse

    data = await request.call(gistId, {
      method: 'GET',
      headers: { 'User-Agent': 'nodejs' }
    })

    const { updated_at, files } = data

    logger.info(`fetched: ${updated_at}`)

    const gistFile = files[this.configService.fileName]
    if (!gistFile) {
      throw new Error(`gist must contain a file named '${this.configService.fileName}'`)
    }

    const aliaConfig = JSON.parse(gistFile.content) as Config

    aliaConfig.meta = this.configService.meta

    this.configService.save(aliaConfig)

    logger.info('...done:', this.configService.filePath)
  }

  public async backup(): Promise<void> {
    logger.info('backup local config to gist...')
    const gistId = this.configService.gistId
    const token = this.configService.token

    const config = this.configService.config
    config.meta = {} as MetaData

    const data = JSON.stringify({
      description: 'Alia Config',
      files: {
        [this.configService.fileName]: {
          content: JSON.stringify(config, null, 2)
        }
      }
    })

    const { html_url } = await request.call(
      gistId,
      {
        method: 'PATCH',
        headers: {
          'User-Agent': 'nodejs',
          Authorization: `token ${token}`
        }
      },
      data
    )

    logger.info('...done:', html_url)
  }
}
