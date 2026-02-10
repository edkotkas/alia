import type { Config, MetaData } from '../models/config.model.js'
import type { GistResponse } from '../models/gist-response.model.js'
import { ConfigService } from './config.service.js'

import { inject } from '../utils/di.js'
import logger from '../utils/logger.js'
import { request } from '../utils/request.js'

export class GistService {
  readonly #configService: ConfigService = inject(ConfigService)

  // constructor(configService: ConfigService) {
  //   this.#configService = configService
  // }

  async restore(): Promise<void> {
    const gistId = this.#configService.gistId
    if (!gistId) {
      throw new Error('gist id not set')
    }

    logger.info('restore config from gist...')

    let data = {} as GistResponse

    data = await request.call(gistId, {
      method: 'GET',
      headers: { 'User-Agent': 'nodejs' }
    })

    const { updated_at, files } = data

    logger.info(`fetched: ${updated_at}`)

    const gistFile = files[this.#configService.fileName]
    if (!gistFile) {
      throw new Error(`gist must contain a file named '${this.#configService.fileName}'`)
    }

    const aliaConfig = JSON.parse(gistFile.content) as Config

    aliaConfig.meta = this.#configService.meta

    this.#configService.save(aliaConfig)

    logger.info('...done:', this.#configService.filePath)
  }

  async backup(): Promise<void> {
    const gistId = this.#configService.gistId
    if (!gistId) {
      throw new Error('gist id not set')
    }

    logger.info('backup local config to gist...')

    const token = this.#configService.token

    const config = this.#configService.config
    config.meta = {} as MetaData

    const data = JSON.stringify({
      description: 'Alia Config',
      files: {
        [this.#configService.fileName]: {
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
