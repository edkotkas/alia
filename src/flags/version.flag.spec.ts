import logger from '../utils/logger'
import type { ConfigService } from '../services/config.service'
import type { GistService } from '../services/gist.service'
import { FlagService } from '../services/flag.service'
import { FlagLoaderService } from '../services/flag-loader.service'

describe('VersionFlag', () => {
  let flagService: FlagService
  let infoSpy: jasmine.Spy
  beforeEach(() => {
    infoSpy = spyOn(logger, 'info').and.callFake(() => ({}))

    flagService = new FlagService(
      { config: { alias: {} } } as ConfigService,
      {} as GistService,
      new FlagLoaderService()
    )
  })

  it('should print version', async () => {
    await flagService.run(['-v'])
    expect(infoSpy).toHaveBeenCalledOnceWith(jasmine.stringMatching(/\d+\.\d+\.\d+/))
  })
})
