import logger from '../utils/logger.js'
import { FlagService } from '../services/flag.service.js'
import { inject } from '../utils/di.js'

describe('VersionFlag', () => {
  let flagService: FlagService
  let infoSpy: jasmine.Spy
  beforeEach(() => {
    infoSpy = spyOn(logger, 'info').and.callFake(() => ({}))

    flagService = inject(FlagService)
  })

  it('should print version', async () => {
    await flagService.run(['-v'])
    expect(infoSpy).toHaveBeenCalledOnceWith(jasmine.stringMatching(/\d+\.\d+\.\d+/))
  })
})
