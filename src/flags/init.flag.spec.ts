import type { ConfigService } from '../services/config.service'
import type { GistService } from '../services/gist.service'
import { FlagService } from '../services/flag.service'

describe('InitFlag', () => {
  let flagService: FlagService
  let configServiceSpy: jasmine.SpyObj<ConfigService>

  beforeEach(() => {
    configServiceSpy = jasmine.createSpyObj<ConfigService>('ConfigService', ['init', 'config'])
    configServiceSpy.config.alias = {}

    flagService = new FlagService(configServiceSpy, {} as GistService)
  })

  it('should initialize config', async () => {
    const initSpy = configServiceSpy.init.and.resolveTo()
    await flagService.run(['-i'])
    expect(initSpy).toHaveBeenCalledWith()
  })
})
