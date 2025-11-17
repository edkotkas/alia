import logger from '../utils/logger.js'
import { FlagService } from '../services/flag.service.js'
import { inject } from '../utils/di.js'

describe('VersionFlag', () => {
  let flagService: FlagService
  let infoSpy: jasmine.Spy
  let initSpy: jasmine.Spy

  beforeEach(() => {
    infoSpy = spyOn(logger, 'info').and.callFake(() => ({}))
    initSpy = spyOn(logger, 'init').and.callFake(() => ({}))

    flagService = inject(FlagService)
  })

  it('should print version', async () => {
    await flagService.run(['-v'])
    expect(infoSpy).toHaveBeenCalledOnceWith(jasmine.stringMatching(/\d+\.\d+\.\d+/))
  })

  it('should not call init logger', async () => {
    await flagService.run(['-v'])
    expect(initSpy).not.toHaveBeenCalled()
    expect(infoSpy).toHaveBeenCalledOnceWith(jasmine.stringMatching(/\d+\.\d+\.\d+/))
  })
})
