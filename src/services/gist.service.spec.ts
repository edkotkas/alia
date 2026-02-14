import type { Config, MetaData } from '../models/config.model.js'
import logger from '../utils/logger.js'
import { ConfigService } from './config.service.js'
import { GistService } from './gist.service.js'

import { clearProviders, provide } from '../utils/di.js'

describe('GistService', () => {
  let gistService: GistService
  let configService: ConfigService
  let infoSpy: jasmine.Spy
  let fetchSpy: jasmine.Spy

  const baseUrl = `https://api.github.com/gists/`

  beforeEach(() => {
    fetchSpy = spyOn(global, 'fetch').and.callFake(() => new Promise(() => ({})))
    configService = {
      gistId: 'gistId',
      token: 'token',
      fileName: 'fileName',
      save: () => ({}),
      config: {} as Config,
      filePath: 'filePath'
    } as unknown as ConfigService

    infoSpy = spyOn(logger, 'info').and.callFake(() => ({}))

    provide(ConfigService, configService)

    gistService = new GistService()
  })

  afterEach(() => {
    clearProviders()
  })

  it('should be defined', () => {
    expect(gistService).toBeDefined()
  })

  describe('Restore', () => {
    it('should fail to restore from gist with bad status code', async () => {
      fetchSpy.and.rejectWith(new Error('Not Found'))

      await expectAsync(gistService.restore()).toBeRejectedWithError('Not Found')
    })

    it('should fail to restore from gist with no file', async () => {
      fetchSpy.and.resolveTo({
        json: () => Promise.resolve({ updated_at: 'test', files: {} })
      })

      await expectAsync(gistService.restore()).toBeRejectedWithError(
        `gist must contain a file named '${configService.fileName}'`
      )
    })

    it('should fail to restore from gist with bad file data', async () => {
      fetchSpy.and.resolveTo({
        json: () => Promise.resolve({ updated_at: 'test', files: { fileName: { content: '{bad}' } } })
      })

      await expectAsync(gistService.restore()).toBeRejected()
    })

    it('should restore gist and save', async () => {
      const rspy = fetchSpy.and.resolveTo({
        json: () => Promise.resolve({ updated_at: 'test', files: { fileName: { content: '{}' } } })
      })

      const spy = spyOn(configService, 'save').and.callFake(() => ({}))

      await expectAsync(gistService.restore()).toBeResolved()

      expect(rspy).toHaveBeenCalledOnceWith(baseUrl + configService.gistId, { method: 'GET' })

      expect(infoSpy).toHaveBeenCalledWith(jasmine.stringContaining('restore config'))
      expect(infoSpy).toHaveBeenCalledWith('fetched: test')
      expect(infoSpy).toHaveBeenCalledWith('...done:', configService.filePath)

      expect(spy).toHaveBeenCalled()
    })

    it('should fail to restore if gist id is not present', async () => {
      configService.gistId = ''
      await expectAsync(gistService.restore()).toBeRejectedWithError('gist id not set')
    })
  })

  describe('Backup', () => {
    beforeEach(() => {
      configService.config.meta = {} as MetaData
      infoSpy.calls.reset()
    })

    it('should fail to backup to gist', async () => {
      fetchSpy.and.rejectWith(new Error('Internal Server Error'))

      await expectAsync(gistService.backup()).toBeRejectedWithError('Internal Server Error')
    })

    it('should backup to gist', async () => {
      const rspy = fetchSpy.and.resolveTo({
        json: () => Promise.resolve({ html_url: 'test' })
      })

      const data = JSON.stringify({
        description: 'Alia Config',
        files: {
          fileName: {
            content: JSON.stringify({ meta: {} }, null, 2)
          }
        }
      })

      await gistService.backup()

      expect(rspy).toHaveBeenCalledOnceWith(baseUrl + configService.gistId, {
        method: 'PATCH',
        headers: {
          Authorization: `token ${configService.token}`
        },
        body: data
      })

      expect(infoSpy).toHaveBeenCalledWith(jasmine.stringContaining('backup local config'))
      expect(infoSpy).toHaveBeenCalledWith('...done:', 'test')
    })
  })

  it('should fail to backup if gist id is not present', async () => {
    configService.gistId = ''
    await expectAsync(gistService.backup()).toBeRejectedWithError('gist id not set')
  })
})
