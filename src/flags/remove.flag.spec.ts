import type { ConfigService } from '../services/config.service'
import type { GistService } from '../services/gist.service'
import logger from '../utils/logger'
import { FlagService } from '../services/flag.service'
import { FlagLoaderService } from '../services/flag-loader.service'

describe('RemoveFlag', () => {
  let flagService: FlagService
  let infoSpy: jasmine.Spy
  let configServiceSpy: jasmine.SpyObj<ConfigService>
  let removeSpy: jasmine.Spy

  beforeEach(() => {
    infoSpy = spyOn(logger, 'info').and.callFake(() => ({}))

    configServiceSpy = jasmine.createSpyObj<ConfigService>('ConfigService', ['config', 'getAlias', 'removeAlias'], {
      isReady: true
    })
    configServiceSpy.config.alias = {
      test: {
        command: ['echo'],
        options: {
          env: {
            TEST: 'test'
          }
        }
      }
    }

    configServiceSpy.getAlias.and.returnValue(configServiceSpy.config.alias.test)

    removeSpy = configServiceSpy.removeAlias.and.callFake(() => ({}))

    flagService = new FlagService(configServiceSpy, {} as GistService, new FlagLoaderService())
  })

  it('should remove alias', async () => {
    await flagService.run(['-r', 'test'])
    expect(removeSpy).toHaveBeenCalledOnceWith('test')
    expect(infoSpy).not.toHaveBeenCalledWith('flag usage:')
    expect(infoSpy).toHaveBeenCalledWith('removed alias: test')
  })

  it('should call info with alias not found', async () => {
    configServiceSpy.getAlias.and.returnValue(undefined)
    await flagService.run(['-r', 'test'])
    expect(infoSpy).toHaveBeenCalledWith(`alias 'test' does not exist`)
    expect(infoSpy).not.toHaveBeenCalledWith('flag usage:')
  })
})
