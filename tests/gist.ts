import type Mocker from 'http-request-mock/src/mocker/mocker-for-node'
import HttpRequestMock from 'http-request-mock'

import { Log } from '../src/logger'
import type { ConfigService} from '../src/services'
import { GistService } from '../src/services'
import { Config, MetaData } from '../src/models'

describe('GistService', () => {

  const gistUrl = 'https://api.github.com/gists/'

  let gistService: GistService
  let configService: jasmine.SpyObj<ConfigService>
  let mocker: Mocker
  let configSpy: jasmine.SpyObj<Config>
  let logSpy: jasmine.Spy

  beforeAll(() => {
    mocker = HttpRequestMock.setup()
  })

  beforeEach(() => {
    configSpy = jasmine.createSpyObj<Config>('Config', ['meta'])
    configService = jasmine.createSpyObj<ConfigService>(
      'ConfigService', 
      ['getMetaData', 'getGistId', 'getToken', 'save'],
      {
        config: configSpy
      }
    )

    configService.getGistId.and.returnValue('gistId')
    configService.getToken.and.returnValue('token')
    configService.save.and.callFake(() => ({}))
    configService.fileName = 'fileName'
    configService.filePath = 'filePath'


    gistService = new GistService(configService)

    logSpy = spyOn(Log, 'info').and.callFake(() => ({}))
  })

  describe('Pull', () => {
    it('should fail to pull from gist with bad status code', async () => {
      mocker.mock({
        url: gistUrl,
        status: 404
      })
  
      await expectAsync(gistService.pull()).toBeRejectedWithError('Not Found')
    })
  
    it('should fail to pull from gist with no file', async () => {
      const expectedResult = {
        files: {
        }
      }
  
      mocker.mock({
        url: gistUrl,
        status: 200,
        body: JSON.stringify(expectedResult)
      })
  
      await expectAsync(gistService.pull()).toBeRejectedWithError(`Gist must contain a file named '${configService.fileName}'`)
    })
  
    it('should fail to pull from gist with bad file data', async () => {
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
  
      await expectAsync(gistService.pull()).toBeRejected()
    })
  
    it('should pull gist and save', async () => {
      const expectedResult = {
        files: {
          fileName: {
            content: '{}'
          }
        }
      }
  
      configService.getMetaData.and.callFake(() => ({
        gist: {
          id: 'id',
          token: 'token'
        }
      }))
  
      mocker.mock({
        url: gistUrl,
        status: 200,
        body: JSON.stringify(expectedResult)
      })
  
      await expectAsync(gistService.pull()).toBeResolved()
      expect(configService.save).toHaveBeenCalled()
    })
  })

  describe('Push', () => {
    beforeEach(() => {
      configSpy.meta = {} as MetaData
      logSpy.calls.reset()
    })

    it('should fail to push to gist', async () => {
      mocker.mock({
        url: gistUrl,
        status: 500
      })
  
      await expectAsync(gistService.push()).toBeRejectedWithError('Internal Server Error')
    })

    it('should push to gist', async () => {
      mocker.mock({
        url: gistUrl,
        status: 200,
        body: {
          html_url: 'test'
        }
      })

      await gistService.push()
  
      expect(Log.info).toHaveBeenCalledWith('...Done:', 'test')
    })
  })
})
