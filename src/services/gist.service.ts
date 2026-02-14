import type { Config, MetaData } from '../models/config.model.js'
import { ConfigService } from './config.service.js'

import type { GistResponse } from '../models/gist-response.model.js'
import { inject } from '../utils/di.js'
import logger from '../utils/logger.js'

export class GistService {
  readonly #configService: ConfigService = inject(ConfigService)
  readonly #baseUrl = `https://api.github.com/gists/`

  async restore(): Promise<void> {
    const gistId = this.#configService.gistId
    if (!gistId) {
      throw new Error('gist id not set')
    }

    logger.info('restore config from gist...')

    const res = await fetch(`${this.#baseUrl}${gistId}`, {
      method: 'GET'
    })

    const { updated_at, files } = (await res.json()) as GistResponse

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

    const res = await fetch(`${this.#baseUrl}${gistId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `token ${token}`
      },
      body: data
    })

    const { html_url } = (await res.json()) as GistResponse

    logger.info('...done:', html_url)
  }
}
