import type Mocker from 'http-request-mock/src/mocker/mocker-for-node'
import HttpRequestMock from 'http-request-mock'

import type { MetaData } from '../models/config.model'
import type { ConfigService } from './config.service'
import { GistService } from './gist.service'
import logger from '../logger'

describe('GistService', () => {
  const gistUrl = 'https://api.github.com/gists/'

  let gistService: GistService
  let configServiceSpy: jasmine.SpyObj<ConfigService>
  let infoSpy: jasmine.Spy

  let mocker: Mocker

  beforeAll(() => {
    mocker = HttpRequestMock.setup()
  })

  beforeEach(() => {
    configServiceSpy = jasmine.createSpyObj<ConfigService>('ConfigService', ['gistId', 'fileName', 'config', 'save'])

    configServiceSpy.gistId = 'gistId'
    configServiceSpy.token = 'token'
    configServiceSpy.fileName = 'fileName'

    infoSpy = spyOn(logger, 'info').and.callFake(() => ({}))

    gistService = new GistService(configServiceSpy)
  })

  it('should be defined', () => {
    expect(gistService).toBeDefined()
  })

  describe('Restore', () => {
    it('should fail to restore from gist with bad status code', async () => {
      mocker.mock({
        url: gistUrl,
        status: 404
      })

      await expectAsync(gistService.restore()).toBeRejectedWithError('Not Found')
    })

    it('should fail to restore from gist with no file', async () => {
      const expectedResult = {
        files: {}
      }

      mocker.mock({
        url: gistUrl,
        status: 200,
        body: JSON.stringify(expectedResult)
      })

      await expectAsync(gistService.restore()).toBeRejectedWithError(
        `Gist must contain a file named '${configServiceSpy.fileName}'`
      )
    })

    it('should fail to restore from gist with bad file data', async () => {
      const expectedResult = {
        files: {
          fileName: '{bad}'
        }
      }

      mocker.mock({
        url: gistUrl,
        status: 200,
        body: JSON.stringify(expectedResult)
      })

      await expectAsync(gistService.restore()).toBeRejected()
    })

    it('should restore gist and save', async () => {
      const expectedResult = {
        files: {
          fileName: {
            content: '{}'
          }
        }
      }

      mocker.mock({
        url: gistUrl,
        status: 200,
        body: JSON.stringify(expectedResult)
      })

      const spy = configServiceSpy.save.and.callFake(() => ({}))

      await expectAsync(gistService.restore()).toBeResolved()
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('Backup', () => {
    beforeEach(() => {
      configServiceSpy.config.meta = {} as MetaData
      infoSpy.calls.reset()
    })

    it('should fail to backup to gist', async () => {
      mocker.mock({
        url: gistUrl,
        status: 500
      })

      await expectAsync(gistService.backup()).toBeRejectedWithError('Internal Server Error')
    })

    it('should backup to gist', async () => {
      mocker.mock({
        url: gistUrl,
        status: 200,
        body: {
          html_url: 'test'
        }
      })

      await gistService.backup()

      expect(infoSpy).toHaveBeenCalledWith('...Done:', 'test')
    })
  })
})
