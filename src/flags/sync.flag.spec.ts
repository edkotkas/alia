import type { ConfigService } from '../services/config.service'
import type { GistService } from '../services/gist.service'
import logger from '../utils/logger'
import { FlagService } from '../services/flag.service'
import { FlagLoaderService } from '../services/flag-loader.service'

describe('SyncFlag', () => {
  let flagService: FlagService
  let backupSpy: jasmine.Spy
  let restoreSpy: jasmine.Spy
  let configServiceSpy: jasmine.SpyObj<ConfigService>
  let gistServiceSpy: jasmine.SpyObj<GistService>
  let infoSpy: jasmine.Spy

  beforeEach(() => {
    infoSpy = spyOn(logger, 'info').and.callFake(() => ({}))

    configServiceSpy = jasmine.createSpyObj<ConfigService>(
      'ConfigService',
      ['config', 'separator', 'getAlias', 'setAlias'],
      {
        isReady: true
      }
    )

    configServiceSpy.separator = '@'
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

    gistServiceSpy = jasmine.createSpyObj<GistService>('GistService', ['restore', 'backup'])

    restoreSpy = gistServiceSpy.restore.and.resolveTo()
    backupSpy = gistServiceSpy.backup.and.resolveTo()

    flagService = new FlagService(configServiceSpy, gistServiceSpy, new FlagLoaderService())

    restoreSpy.calls.reset()
    backupSpy.calls.reset()
  })

  it('should backup', async () => {
    await flagService.run(['-sy', '-b'])
    expect(backupSpy).toHaveBeenCalled()
    expect(restoreSpy).not.toHaveBeenCalled()
    expect(infoSpy).not.toHaveBeenCalledWith('flag usage:')
  })

  it('should restore', async () => {
    await flagService.run(['-sy', '-r'])
    expect(restoreSpy).toHaveBeenCalledOnceWith()
    expect(infoSpy).not.toHaveBeenCalledWith('flag usage:')
  })

  it('should restore with no options', async () => {
    await flagService.run(['-sy'])
    expect(restoreSpy).toHaveBeenCalledOnceWith()
    expect(infoSpy).not.toHaveBeenCalledWith('flag usage:')
  })
})
