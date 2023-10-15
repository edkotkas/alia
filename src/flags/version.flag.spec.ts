import logger from '../logger'
import type { ConfigService } from '../services/config.service'
import { FlagService } from '../services/flag.service'
import type { GistService } from '../services/gist.service'
import { file } from '../utils/file'

describe('VersionFlag', () => {
  let flagService: FlagService
  beforeEach(() => {
    spyOn(logger, 'info').and.callFake(() => ({}))

    spyOn(file, 'read').and.returnValue('test').and.returnValue('{"version": "1.0.0"}')

    flagService = new FlagService({ config: { alias: {} } } as ConfigService, {} as GistService)
  })

  it('should print version', async () => {
    await flagService.run(['-v'])
    expect(logger.info).toHaveBeenCalledWith(`1.0.0`)
  })
})
