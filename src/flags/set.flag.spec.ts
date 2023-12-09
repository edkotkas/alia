import type { ConfigService } from '../services/config.service'
import type { GistService } from '../services/gist.service'
import logger from '../logger'
import { FlagService } from '../services/flag.service'
import path from 'node:path'

describe('SetFlag', () => {
  let flagService: FlagService
  let infoSpy: jasmine.Spy
  let setSpy: jasmine.Spy
  let configServiceSpy: jasmine.SpyObj<ConfigService>
  let infoResult: string[][]
  beforeEach(() => {
    infoResult = []
    infoSpy = spyOn(logger, 'info').and.callFake((...data: unknown[]) => {
      infoResult = [...infoResult, data as string[]]
    })
    setSpy = spyOn(logger, 'set').and.callFake(() => ({}))

    configServiceSpy = jasmine.createSpyObj<ConfigService>('ConfigService', [
      'config',
      'separator',
      'getAlias',
      'setAlias'
    ])
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

    flagService = new FlagService(configServiceSpy, {} as GistService)

    infoSpy.calls.reset()
  })

  it('should set an alias', async () => {
    await flagService.run(['-s', 'test', '@', 'echo', 'test2'])
    expect(infoSpy).toHaveBeenCalledWith('set alias: test @ echo test2')
  })

  it('should set an alias with shell option', async () => {
    await flagService.run(['-s', '--shell', 'test', '@', 'echo', 'test2'])
    expect(setSpy).toHaveBeenCalledWith('shell', true)
  })

  it('should log error if shell option is not valid', async () => {
    await flagService.run(['-s', '--shell', 'test', 'test', '@', 'echo', 'test2'])
    expect(infoSpy).toHaveBeenCalledWith(`invalid value for shell: 'test'`)
  })

  it('should set an alias with env option', async () => {
    await flagService.run(['-s', '--env', 'TEST=test', 'test', '@', 'echo', 'test2'])
    expect(setSpy).toHaveBeenCalledWith('ENV variables', '')
  })

  it('should log error if env option is not valid', async () => {
    await flagService.run(['-s', '--env', 'test', '@', 'echo', 'test2'])
    expect(infoSpy).toHaveBeenCalledWith(`invalid value for env`)
  })

  it('should set alias with multiple env variables', async () => {
    await flagService.run(['-s', '--env', 'TEST=test', '--env', 'TEST2=test2', 'test', '@', 'echo', 'test2'])
    expect(infoResult).toEqual([['\t', 'TEST=test'], ['\t', 'TEST2=test2'], ['set alias: test @ echo test2']])
  })

  it('should set an alias with env file option', async () => {
    await flagService.run(['-s', '--env-file', 'test.env', 'test', '@', 'echo', 'test2'])
    expect(setSpy).toHaveBeenCalledWith('ENV File', path.resolve('test.env'))
  })

  it('should log error if env file option is not valid', async () => {
    await flagService.run(['-s', '--env-file', 'test', '@', 'echo', 'test2'])
    expect(infoSpy).toHaveBeenCalledWith(`invalid value for env-file`)
  })

  it('should throw error witout separator', async () => {
    await flagService.run(['-s', 'test', 'echo', 'test2'])
    expect(infoResult).toEqual([[`invalid input, missing separator: '@'`]])
  })

  it('should update existing alias', async () => {
    configServiceSpy.getAlias.and.returnValue(configServiceSpy.config.alias.test)
    await flagService.run(['-s', 'test', '@', 'echo', 'test2'])
    expect(infoResult).toEqual([['unset alias: test @ echo'], ['set alias: test @ echo test2']])
  })

  it('should log error if alias is not valid', async () => {
    await flagService.run(['-s', '@'])
    expect(infoSpy).toHaveBeenCalledWith(`invalid arguments passed: '' @ ''`)
  })

  it('should add quotes to command', async () => {
    await flagService.run(['-s', '-q', 'test', '@', 'echo', 'test 2'])
    expect(setSpy).toHaveBeenCalledWith('quote', true)
  })

  it('should log error if quote option is not valid', async () => {
    await flagService.run(['-s', '-q', 'test', 'test', '@', 'echo', 'test2'])
    expect(infoSpy).toHaveBeenCalledWith(`invalid value for quote: 'test'`)
  })
})
