import type { ConfigService } from '../services/config.service'
import type { GistService } from '../services/gist.service'
import logger from '../logger'
import { FlagService } from '../services/flag.service'

describe('RemoveFlag', () => {
  let flagService: FlagService
  let infoSpy: jasmine.Spy
  let configServiceSpy: jasmine.SpyObj<ConfigService>
  let removeSpy: jasmine.Spy

  beforeEach(() => {
    infoSpy = spyOn(logger, 'info').and.callFake(() => ({}))

    configServiceSpy = jasmine.createSpyObj<ConfigService>('ConfigService', ['config', 'getAlias', 'removeAlias'])
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

    flagService = new FlagService(configServiceSpy, {} as GistService)
  })

  it('should remove alias', async () => {
    await flagService.run(['-r', 'test'])
    expect(removeSpy).toHaveBeenCalledOnceWith('test')
  })

  it('should call info with alias not found', async () => {
    configServiceSpy.getAlias.and.returnValue(undefined)
    await flagService.run(['-r', 'test'])
    expect(infoSpy).toHaveBeenCalledWith(`Alias 'test' does not exist`)
  })
})
