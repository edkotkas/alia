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
    await flagService.run(['-s', 'test', '@', 'echo', 'test2', '--shell'])
    expect(setSpy).toHaveBeenCalledWith('shell', true)
  })

  it('should log error if shell option is not valid', async () => {
    await flagService.run(['-s', 'test', '@', 'echo', 'test2', '--shell', 'test'])
    expect(infoSpy).toHaveBeenCalledWith(`invalid value for shell: 'test'`)
  })

  it('should set an alias with env option', async () => {
    await flagService.run(['-s', 'test', '@', 'echo', 'test2', '--env', 'TEST=test'])
    expect(setSpy).toHaveBeenCalledWith('ENV variables', '')
  })

  it('should log error if env option is not valid', async () => {
    await flagService.run(['-s', 'test', '@', 'echo', 'test2', '--env'])
    expect(infoSpy).toHaveBeenCalledWith(`invalid value for env`)
  })

  it('should set an alias with env file option', async () => {
    await flagService.run(['-s', 'test', '@', 'echo', 'test2', '--env-file', 'test.env'])
    expect(setSpy).toHaveBeenCalledWith('ENV File', path.resolve('test.env'))
  })

  it('should log error if env file option is not valid', async () => {
    await flagService.run(['-s', 'test', '@', 'echo', 'test2', '--env-file'])
    expect(infoSpy).toHaveBeenCalledWith(`invalid value for env-file`)
  })

  it('should throw error witout separator', async () => {
    await expectAsync(flagService.run(['-s', 'test', 'echo', 'test2'])).toBeRejectedWithError(
      "invalid input, missing separator: '@'"
    )
  })

  it('should update existing alias', async () => {
    configServiceSpy.getAlias.and.returnValue(configServiceSpy.config.alias.test)
    await flagService.run(['-s', 'test', '@', 'echo', 'test2'])
    expect(infoResult).toEqual([['unset alias: test @ echo'], ['set alias: test @ echo test2']])
  })
})
