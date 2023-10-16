import type { ConfigService } from '../services/config.service'
import type { GistService } from '../services/gist.service'
import logger from '../logger'
import { FlagService } from '../services/flag.service'

describe('ListFlag', () => {
  let flagService: FlagService
  let infoSpy: jasmine.Spy
  let configServiceSpy: jasmine.SpyObj<ConfigService>

  beforeEach(() => {
    infoSpy = spyOn(logger, 'info').and.callFake(() => ({}))

    configServiceSpy = jasmine.createSpyObj<ConfigService>('ConfigService', ['config', 'separator'])
    configServiceSpy.separator = '@'
    configServiceSpy.config.alias = {
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

    flagService = new FlagService(configServiceSpy, {} as GistService)

    infoSpy.calls.reset()
  })

  it('should list aliases', async () => {
    await flagService.run(['-l'])
    expect(infoSpy).toHaveBeenCalledWith(`test \t@ \techo\natest \t@ \techo another`)
  })

  it('should list aliases sorted', async () => {
    await flagService.run(['-l', '-s'])
    expect(infoSpy).toHaveBeenCalledWith(`atest \t@ \techo another\ntest \t@ \techo`)
  })

  it('should list aliases in json format', async () => {
    await flagService.run(['-l', '-j'])
    expect(infoSpy).toHaveBeenCalledWith(JSON.stringify(configServiceSpy.config.alias, null, 2))
  })

  it('should list aliases in json format sorted', async () => {
    await flagService.run(['-l', '-j', '-s'])
    expect(infoSpy).toHaveBeenCalledWith(
      JSON.stringify(
        {
          atest: configServiceSpy.config.alias.atest,
          test: configServiceSpy.config.alias.test
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
          test: configServiceSpy.config.alias.test
        },
        null,
        2
      )
    )
  })
})
