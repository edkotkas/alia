import type { ConfigService } from '../services/config.service'
import type { GistService } from '../services/gist.service'
import logger from '../utils/logger'
import { file } from '../utils/file'
import { FlagService } from '../services/flag.service'
import { FlagLoaderService } from '../services/flag-loader.service'
import type { Config } from '../models/config.model'

describe('ConfFlag', () => {
  let flagService: FlagService
  let infoSpy: jasmine.Spy
  let setSpy: jasmine.Spy
  let readSpy: jasmine.Spy
  let fakeConfigService: ConfigService

  beforeEach(() => {
    infoSpy = spyOn(logger, 'info').and.callFake((..._: unknown[]) => ({}))
    readSpy = spyOn(file, 'read').and.callFake(() => '{}')

    setSpy = spyOn(logger, 'set').and.callFake(() => ({}))

    fakeConfigService = {
      config: {
        alias: {}
      } as Config,
      isReady: true,
      separator: '!',
      getAlias: () => undefined,
      setAlias: () => ({}),
      save: () => ({}),
      defaultConfig: {
        options: {
          separator: '@'
        }
      }
    } as unknown as ConfigService

    flagService = new FlagService(fakeConfigService, {} as GistService, new FlagLoaderService())
    infoSpy.calls.reset()
  })

  it('should set separator', async () => {
    const result = await flagService.run(['--conf', '-s', '#'])
    expect(result).toBeTrue()
    expect(setSpy).toHaveBeenCalledWith('separator', fakeConfigService.separator)
    expect(infoSpy).not.toHaveBeenCalledWith('flag usage:')
  })

  it('should set separator to default without value', async () => {
    readSpy.and.callFake(() => {
      return JSON.stringify({
        options: {
          separator: '@'
        },
        alias: {}
      })
    })
    await flagService.run(['-c', '-s'])
    expect(setSpy).toHaveBeenCalledWith('separator', fakeConfigService.defaultConfig.options.separator)
  })

  it('should set gist id', async () => {
    const result = await flagService.run(['-c', '-g', 'test'])
    expect(result).toBeTrue()
    expect(setSpy).toHaveBeenCalledWith('gist', fakeConfigService.gistId)
    expect(infoSpy).not.toHaveBeenCalledWith('flag usage:')
  })

  it('should log error if no gist id is provided', async () => {
    await flagService.run(['-c', '-g'])
    expect(infoSpy).toHaveBeenCalledWith('must specify a gist id')
    expect(infoSpy).toHaveBeenCalledWith('flag usage:')
  })

  it('should set gist token', async () => {
    const result = await flagService.run(['-c', '-t', 'test'])
    expect(result).toBeTrue()
    expect(setSpy).toHaveBeenCalledWith('token', fakeConfigService.token)
    expect(infoSpy).not.toHaveBeenCalledWith('flag usage:')
  })

  it('should log error if no token is provided', async () => {
    await flagService.run(['-c', '-t'])
    expect(infoSpy).toHaveBeenCalledWith(`must specify a token`)
    expect(infoSpy).toHaveBeenCalledWith('flag usage:')
  })

  it('should set shell', async () => {
    const result = await flagService.run(['-c', '--shell'])
    expect(result).toBeTrue()
    expect(setSpy).toHaveBeenCalledWith('shell', fakeConfigService.shell)
    expect(infoSpy).not.toHaveBeenCalledWith('flag usage:')
  })

  it('should log error if invalid value provided for shell', async () => {
    await flagService.run(['-c', '-sh', 'test'])
    expect(infoSpy).toHaveBeenCalledWith(`invalid value for shell flag: test`)
    expect(infoSpy).toHaveBeenCalledWith('flag usage:')
  })

  it('should show path', async () => {
    const result = await flagService.run(['-c', '-p'])
    expect(result).toBeTrue()
    expect(infoSpy).toHaveBeenCalledWith(fakeConfigService.filePath)
  })

  it('should show path - with full key', async () => {
    await flagService.run(['--conf', '--path'])
    expect(infoSpy).toHaveBeenCalledWith(fakeConfigService.filePath)
    expect(infoSpy).not.toHaveBeenCalledWith('flag usage:')
  })
})
