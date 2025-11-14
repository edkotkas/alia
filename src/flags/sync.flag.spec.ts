import { ConfigService } from '../services/config.service.js'
import { GistService } from '../services/gist.service.js'
import logger from '../utils/logger.js'
import { FlagService } from '../services/flag.service.js'
import { clearProviders, inject, provide } from '../utils/di.js'

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

    provide(ConfigService, configServiceSpy)
    provide(GistService, gistServiceSpy)

    flagService = inject(FlagService)

    restoreSpy.calls.reset()
    backupSpy.calls.reset()
  })

  afterEach(() => {
    clearProviders()
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
