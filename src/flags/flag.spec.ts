import type { ConfigService } from '../services/config.service'
import type { GistService } from '../services/gist.service'
import logger from '../logger'
import { FlagService } from '../services/flag.service'

describe('Flag', () => {
  let flagService: FlagService
  let infoSpy: jasmine.Spy
  let configServiceSpy: jasmine.SpyObj<ConfigService>

  beforeEach(() => {
    infoSpy = spyOn(logger, 'info').and.callFake(() => ({}))

    configServiceSpy = jasmine.createSpyObj<ConfigService>(
      'ConfigService',
      ['config', 'separator', 'getAlias', 'setAlias', 'save'],
      {
        isReady: true
      }
    )
    configServiceSpy.separator = '@'
    configServiceSpy.config.alias = {}

    configServiceSpy.getAlias.and.returnValue(undefined)
    configServiceSpy.setAlias.and.callFake(() => ({}))

    flagService = new FlagService(configServiceSpy, {} as GistService)
    infoSpy.calls.reset()
  })

  it('should use invalid value for flag', async () => {
    await flagService.run(['-c', '-t'])
    expect(infoSpy).toHaveBeenCalledWith(`must specify a token`)
  })
})
