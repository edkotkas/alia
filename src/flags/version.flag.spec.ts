import path from 'path'
import { FlagService } from '../services/flag.service.js'
import { inject } from '../utils/di.js'
import { file } from '../utils/file.js'
import logger from '../utils/logger.js'

describe('VersionFlag', () => {
  let flagService: FlagService
  let infoSpy: jasmine.Spy
  let initSpy: jasmine.Spy
  let readSpy: jasmine.Spy

  beforeEach(() => {
    infoSpy = spyOn(logger, 'info').and.callFake(() => ({}))
    initSpy = spyOn(logger, 'init').and.callFake(() => ({ version: '0.0.0' }))
    readSpy = spyOn(file, 'read').and.callFake((path) => {
      if (path.endsWith('package.json')) {
        return JSON.stringify({ version: '1.2.3' })
      }

      return JSON.stringify({ alias: { test: { cmd: 'echo test' } }, options: {} })
    })

    flagService = inject(FlagService)
  })

  it('should print version', async () => {
    await flagService.run(['-v'])
    expect(initSpy).not.toHaveBeenCalled()
    expect(readSpy).toHaveBeenCalledWith(path.resolve(import.meta.dirname, '..', '..', 'package.json'))
    expect(infoSpy).toHaveBeenCalledOnceWith(jasmine.stringMatching(/\d+\.\d+\.\d+/))
  })
})
