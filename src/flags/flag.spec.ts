import type { ConfigService } from '../services/config.service'
import type { GistService } from '../services/gist.service'
import logger from '../utils/logger'
import { FlagService } from '../services/flag.service'
import { FlagLoaderService } from '../services/flag-loader.service'
import type { ConfFlag } from './conf.flag'
import { Flag } from './flag'
import type { FlagData, FlagInfo } from '../models/flag.model'

describe('Flag', () => {
  let flagService: FlagService
  let infoSpy: jasmine.Spy
  let configServiceSpy: jasmine.SpyObj<ConfigService>
  let flagLoaderServiceSpy: jasmine.SpyObj<FlagLoaderService>

  beforeEach(() => {
    infoSpy = spyOn(logger, 'info').and.callFake(() => ({}))

    configServiceSpy = jasmine.createSpyObj<ConfigService>(
      'ConfigService',
      ['config', 'separator', 'getAlias', 'setAlias', 'save'],
      {
        isReady: true
      }
    )
    configServiceSpy.separator = '@'
    configServiceSpy.config.alias = {}

    configServiceSpy.getAlias.and.returnValue(undefined)
    configServiceSpy.setAlias.and.callFake(() => ({}))

    flagLoaderServiceSpy = jasmine.createSpyObj<FlagLoaderService>('FlagLoaderService', ['loadFlags'])

    flagService = new FlagService(configServiceSpy, {} as GistService, flagLoaderServiceSpy)
    infoSpy.calls.reset()
  })

  it('should log error for invalid modifier', async () => {
    flagLoaderServiceSpy.loadFlags.and.resolveTo([
      {
        flag: {
          short: 'c'
        },
        mods: []
      } as unknown as ConfFlag
    ])

    await flagService.run(['-c', '-t'])

    expect(infoSpy).toHaveBeenCalledWith(jasmine.stringContaining('unknown flag: -t'))
  })

  it('should pass for mod with no run function', async () => {
    const flag = new Flag({} as ConfigService, {} as GistService)
    flag.flag = {
      short: 'c'
    } as FlagInfo
    flag.mods = [
      {
        key: 'test',
        short: 't'
      }
    ] as FlagInfo[]

    flagLoaderServiceSpy.loadFlags.and.resolveTo([flag])

    const result = await flagService.run(['-c', '-t'])

    expect(result).toBeTrue()
    expect(infoSpy).not.toHaveBeenCalledWith('flag usage:')
  })

  it('should pass for flag with no run function', async () => {
    const flag = new Flag({} as ConfigService, {} as GistService)
    flag.flag = {
      short: 'c'
    } as FlagInfo

    flagLoaderServiceSpy.loadFlags.and.resolveTo([flag])

    const result = await flagService.run(['-c'])

    expect(result).toBeTrue()
    expect(infoSpy).not.toHaveBeenCalledWith('flag usage:')
  })

  it('should return false on flag run fail', async () => {
    const flag = new Flag({} as ConfigService, {} as GistService)
    flag.flag = {
      short: 'c',
      run: (_: string[], __?: FlagData) => false
    } as FlagInfo

    flagLoaderServiceSpy.loadFlags.and.resolveTo([flag])

    const result = await flagService.run(['-c'])

    expect(result).toBeTrue()
    expect(infoSpy).toHaveBeenCalledWith('flag usage:')
  })
})
