import type { ConfigService } from '../services/config.service'
import type { GistService } from '../services/gist.service'
import type { Config } from '../models/config.model'
import logger from '../logger'
import { FlagService } from '../services/flag.service'

describe('ConfFlag', () => {
  let flagService: FlagService
  let infoSpy: jasmine.Spy
  let setSpy: jasmine.Spy
  let infoResult: (string | boolean)[][]
  let configServiceSpy: jasmine.SpyObj<ConfigService>

  beforeEach(() => {
    infoResult = []
    infoSpy = spyOn(logger, 'info').and.callFake((...data: unknown[]) => {
      infoResult = [...infoResult, data as string[]]
    })

    setSpy = spyOn(logger, 'set').and.callFake(() => ({}))

    configServiceSpy = jasmine.createSpyObj<ConfigService>(
      'ConfigService',
      ['config', 'separator', 'getAlias', 'setAlias', 'save'],
      {
        isReady: true
      }
    )
    configServiceSpy.separator = '@'
    configServiceSpy.config.alias = {}
    configServiceSpy.defaultConfig = {
      options: {
        separator: '@'
      },
      alias: {}
    } as Config

    configServiceSpy.getAlias.and.returnValue(undefined)
    configServiceSpy.setAlias.and.callFake(() => ({}))

    flagService = new FlagService(configServiceSpy, {} as GistService)
    infoSpy.calls.reset()
  })

  it('should set separator', async () => {
    await flagService.run(['-c', '-s', '#'])
    expect(setSpy).toHaveBeenCalledWith('separator', configServiceSpy.separator)
  })

  it('should set separator to default without value', async () => {
    await flagService.run(['-c', '-s'])
    expect(setSpy).toHaveBeenCalledWith('separator', configServiceSpy.separator)
  })

  it('should set gist id', async () => {
    await flagService.run(['-c', '-g', 'test'])
    expect(setSpy).toHaveBeenCalledWith('gist', configServiceSpy.gistId)
  })

  it('should log error if no gist id is provided', async () => {
    await flagService.run(['-c', '-g'])
    expect(infoSpy).toHaveBeenCalledWith('must specify a gist id')
  })

  it('should set gist token', async () => {
    await flagService.run(['-c', '-t', 'test'])
    expect(setSpy).toHaveBeenCalledWith('token', configServiceSpy.token)
  })

  it('should log error if no token is provided', async () => {
    await flagService.run(['-c', '-t'])
    expect(infoSpy).toHaveBeenCalledWith(`must specify a token`)
  })

  it('should set shell', async () => {
    await flagService.run(['-c', '-sh'])
    expect(setSpy).toHaveBeenCalledWith('shell', configServiceSpy.shell)
  })

  it('should log error if invalid value provided for shell', async () => {
    await flagService.run(['-c', '-sh', 'test'])
    expect(infoSpy).toHaveBeenCalledWith(`invalid value for shell flag: test`)
  })

  it('should show path', async () => {
    await flagService.run(['-c', '-p'])
    expect(infoSpy).toHaveBeenCalledWith(configServiceSpy.filePath)
  })
})
