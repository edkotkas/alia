import type { ConfigService } from '../services/config.service'
import type { GistService } from '../services/gist.service'
import logger from '../utils/logger'
import { FlagService } from '../services/flag.service'
import { FlagLoaderService } from '../services/flag-loader.service'

describe('ListFlag', () => {
  let flagService: FlagService
  let infoSpy: jasmine.Spy
  let fakeConfigService: ConfigService

  const alias = {
    test: {
      command: ['echo'],
      options: {
        env: {
          TEST: 'test'
        }
      }
    },
    atest: {
      command: ['echo', 'another'],
      options: {}
    }
  }

  beforeEach(() => {
    infoSpy = spyOn(logger, 'info').and.callFake(() => ({}))

    fakeConfigService = {
      config: {
        alias
      },
      separator: '@',
      keys: Object.keys(alias),
      alias: alias,
      isReady: true
    } as unknown as ConfigService

    flagService = new FlagService(fakeConfigService, {} as GistService, new FlagLoaderService())

    infoSpy.calls.reset()
  })

  it('should list aliases', async () => {
    await flagService.run(['-l'])
    expect(infoSpy).toHaveBeenCalledWith(`test \t@ \techo\natest \t@ \techo another`)
    expect(infoSpy).not.toHaveBeenCalledWith('flag usage:')
  })

  it('should list aliases sorted', async () => {
    await flagService.run(['-l', '-s'])
    expect(infoSpy).toHaveBeenCalledWith(`atest \t@ \techo another\ntest \t@ \techo`)
  })

  it('should list aliases in json format', async () => {
    await flagService.run(['-l', '-j'])
    expect(infoSpy).toHaveBeenCalledWith(JSON.stringify(fakeConfigService.config.alias, null, 2))
    expect(infoSpy).not.toHaveBeenCalledWith('flag usage:')
  })

  it('should list aliases in json format sorted', async () => {
    await flagService.run(['-l', '-j', '-s'])
    expect(infoSpy).toHaveBeenCalledWith(
      JSON.stringify(
        {
          atest: fakeConfigService.config.alias.atest,
          test: fakeConfigService.config.alias.test
        },
        null,
        2
      )
    )
  })

  it('should list aliases filtered', async () => {
    await flagService.run(['-l', '-f', 'test'])
    expect(infoSpy).toHaveBeenCalledWith(`test \t@ \techo`)
  })

  it('should list aliases filtered in json format', async () => {
    await flagService.run(['-l', '-f', 'test', '-j'])
    expect(infoSpy).toHaveBeenCalledWith(
      JSON.stringify(
        {
          test: fakeConfigService.config.alias.test
        },
        null,
        2
      )
    )
  })
})
