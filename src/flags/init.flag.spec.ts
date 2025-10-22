import { ConfigService } from '../services/config.service.js'
import { FlagService } from '../services/flag.service.js'
import { clearProviders, inject, provide } from '../utils/di.js'
import logger from '../utils/logger.js'

describe('InitFlag', () => {
  let flagService: FlagService
  let configServiceSpy: jasmine.SpyObj<ConfigService>
  let infoSpy: jasmine.Spy

  beforeEach(() => {
    infoSpy = spyOn(logger, 'info').and.callFake((..._: unknown[]) => ({}))

    configServiceSpy = jasmine.createSpyObj<ConfigService>('ConfigService', ['init', 'config'])
    configServiceSpy.config.alias = {}

    provide(ConfigService, configServiceSpy)

    flagService = inject(FlagService)
  })

  afterEach(() => {
    clearProviders()
  })

  it('should initialize config', async () => {
    const initSpy = configServiceSpy.init.and.resolveTo()
    await flagService.run(['-i'])
    expect(initSpy).toHaveBeenCalledWith()
    expect(infoSpy).not.toHaveBeenCalledWith('flag usage:')
  })
})
