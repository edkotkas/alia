import type { Config, MetaData } from '../models/config.model.js'
import logger from '../utils/logger.js'
import { ConfigService } from './config.service.js'
import { GistService } from './gist.service.js'

import { clearProviders, provide } from '../utils/di.js'
import { request } from '../utils/request.js'

describe('GistService', () => {
  let gistService: GistService
  let fakeConfigService: ConfigService
  let infoSpy: jasmine.Spy
  let requestSpy: jasmine.Spy

  beforeEach(() => {
    requestSpy = spyOn(request, 'call').and.callFake(() => new Promise(() => ({})))
    fakeConfigService = {
      gistId: 'gistId',
      token: 'token',
      fileName: 'fileName',
      save: () => ({}),
      config: {} as Config,
      filePath: 'filePath'
    } as unknown as ConfigService

    infoSpy = spyOn(logger, 'info').and.callFake(() => ({}))

    provide(ConfigService, fakeConfigService)

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
      requestSpy.and.rejectWith(new Error('Not Found'))

      await expectAsync(gistService.restore()).toBeRejectedWithError('Not Found')
    })

    it('should fail to restore from gist with no file', async () => {
      requestSpy.and.resolveTo({ updated_at: 'test', files: {} })

      await expectAsync(gistService.restore()).toBeRejectedWithError(
        `gist must contain a file named '${fakeConfigService.fileName}'`
      )
    })

    it('should fail to restore from gist with bad file data', async () => {
      requestSpy.and.resolveTo({ updated_at: 'test', files: { fileName: { content: '{bad}' } } })

      await expectAsync(gistService.restore()).toBeRejected()
    })

    it('should restore gist and save', async () => {
      const rspy = requestSpy.and.resolveTo({ updated_at: 'test', files: { fileName: { content: '{}' } } })

      const spy = spyOn(fakeConfigService, 'save').and.callFake(() => ({}))

      await expectAsync(gistService.restore()).toBeResolved()

      expect(rspy).toHaveBeenCalledOnceWith('gistId', { method: 'GET', headers: { 'User-Agent': 'nodejs' } })

      expect(infoSpy).toHaveBeenCalledWith(jasmine.stringContaining('restore config'))
      expect(infoSpy).toHaveBeenCalledWith('fetched: test')
      expect(infoSpy).toHaveBeenCalledWith('...done:', fakeConfigService.filePath)

      expect(spy).toHaveBeenCalled()
    })

    it('should fail to restore if gist id is not present', async () => {
      fakeConfigService.gistId = ''
      await expectAsync(gistService.restore()).toBeRejectedWithError('gist id not set')
    })
  })

  describe('Backup', () => {
    beforeEach(() => {
      fakeConfigService.config.meta = {} as MetaData
      infoSpy.calls.reset()
    })

    it('should fail to backup to gist', async () => {
      requestSpy.and.rejectWith(new Error('Internal Server Error'))

      await expectAsync(gistService.backup()).toBeRejectedWithError('Internal Server Error')
    })

    it('should backup to gist', async () => {
      const rspy = requestSpy.and.resolveTo({ html_url: 'test' })

      const data = JSON.stringify({
        description: 'Alia Config',
        files: {
          fileName: {
            content: JSON.stringify({ meta: {} }, null, 2)
          }
        }
      })

      await gistService.backup()

      expect(rspy).toHaveBeenCalledOnceWith(
        'gistId',
        {
          method: 'PATCH',
          headers: {
            'User-Agent': 'nodejs',
            Authorization: `token ${fakeConfigService.token}`
          }
        },
        data
      )

      expect(infoSpy).toHaveBeenCalledWith(jasmine.stringContaining('backup local config'))
      expect(infoSpy).toHaveBeenCalledWith('...done:', 'test')
    })
  })

  it('should fail to backup if gist id is not present', async () => {
    fakeConfigService.gistId = ''
    await expectAsync(gistService.backup()).toBeRejectedWithError('gist id not set')
  })
})
