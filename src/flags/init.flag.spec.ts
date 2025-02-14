import type { ConfigService } from '../services/config.service'
import type { GistService } from '../services/gist.service'
import { FlagService } from '../services/flag.service'
import { FlagLoaderService } from '../services/flag-loader.service'
import logger from '../utils/logger'

describe('InitFlag', () => {
  let flagService: FlagService
  let configServiceSpy: jasmine.SpyObj<ConfigService>
  let infoSpy: jasmine.Spy

  beforeEach(() => {
    infoSpy = spyOn(logger, 'info').and.callFake((..._: unknown[]) => ({}))

    configServiceSpy = jasmine.createSpyObj<ConfigService>('ConfigService', ['init', 'config'])
    configServiceSpy.config.alias = {}

    flagService = new FlagService(configServiceSpy, {} as GistService, new FlagLoaderService())
  })

  it('should initialize config', async () => {
    const initSpy = configServiceSpy.init.and.resolveTo()
    await flagService.run(['-i'])
    expect(initSpy).toHaveBeenCalledWith()
    expect(infoSpy).not.toHaveBeenCalledWith('flag usage:')
  })
})
