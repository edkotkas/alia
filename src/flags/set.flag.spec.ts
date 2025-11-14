import { ConfigService } from '../services/config.service.js'
import logger from '../utils/logger.js'
import { FlagService } from '../services/flag.service.js'
import path from 'node:path'
import { clearProviders, inject, provide } from '../utils/di.js'

describe('SetFlag', () => {
  let flagService: FlagService
  let infoSpy: jasmine.Spy
  let setSpy: jasmine.Spy
  let configServiceSpy: jasmine.SpyObj<ConfigService>

  beforeEach(() => {
    infoSpy = spyOn(logger, 'info').and.callFake(() => ({}))
    setSpy = spyOn(logger, 'set').and.callFake(() => ({}))

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
      },
      test2: {
        command: ['echo', 'test2'],
        options: {}
      }
    }

    provide(ConfigService, configServiceSpy)

    flagService = inject(FlagService)

    infoSpy.calls.reset()
  })

  afterEach(() => {
    clearProviders()
  })

  it('should set an alias', async () => {
    await flagService.run(['-s', '-k', 'test', '-c', 'echo test2'])
    expect(infoSpy).toHaveBeenCalledWith('set alias: test => echo test2')
    expect(infoSpy).not.toHaveBeenCalledWith('flag usage:')
  })

  it('should set an alias with shell option', async () => {
    await flagService.run(['-s', '--shell', '-k', 'test', '-c', 'echo test2'])
    expect(setSpy).toHaveBeenCalledWith('shell', true)
    expect(infoSpy).not.toHaveBeenCalledWith('flag usage:')
  })

  it('should log error if shell option is not valid', async () => {
    await flagService.run(['-s', '--shell', 'test', '-k', 'test', '-c', 'echo test'])
    expect(infoSpy).toHaveBeenCalledWith(`invalid value for shell flag: test`)
    expect(infoSpy).toHaveBeenCalledWith('flag usage:')
  })

  it('should set an alias with env option', async () => {
    await flagService.run(['-s', '--env', 'TEST=test', '-k', 'test', '-c', 'echo test2'])
    expect(infoSpy).toHaveBeenCalledWith('ENV variables', '')
    expect(infoSpy).toHaveBeenCalledWith('\t', 'TEST=test')
    expect(infoSpy).not.toHaveBeenCalledWith('flag usage:')
  })

  it('should log error if env option is not provided', async () => {
    await flagService.run(['-s', '--env', '-k', 'test', '-c', 'echo test2'])
    expect(infoSpy).toHaveBeenCalledWith(`invalid value for env flag: undefined`)
    expect(infoSpy).toHaveBeenCalledWith('flag usage:')
  })

  it('should log error if env option is not valid', async () => {
    await flagService.run(['-s', '--env', 'TEST', '-k', 'test', '-c', 'echo', 'test2'])
    expect(infoSpy).toHaveBeenCalledWith(`invalid value for env flag: TEST`)
    expect(infoSpy).toHaveBeenCalledWith('flag usage:')
  })

  it('should log error if env option is not valid with multiple =', async () => {
    await flagService.run(['-s', '--env', 'TEST=test=test', '-k', 'test', '-c', 'echo test2'])
    expect(infoSpy).toHaveBeenCalledWith(`invalid value for env flag: TEST=test=test`)
  })

  it('should set alias with multiple env variables', async () => {
    await flagService.run(['-s', '--env', 'TEST=test', '--env', 'TEST2=test2', '-k', 'test', '-c', 'echo test2'])
    expect(infoSpy).toHaveBeenCalledWith('\t', 'TEST=test')
    expect(infoSpy).toHaveBeenCalledWith('\t', 'TEST2=test2')
    expect(infoSpy).toHaveBeenCalledWith('set alias: test => echo test2')
  })

  it('should not set alias with empty env variables', async () => {
    await flagService.run(['-s', '--env', 'TEST=', '-k', 'test', '-c', 'echo', 'test2'])
    expect(infoSpy).toHaveBeenCalledWith(`invalid value for env flag: TEST=`)
  })

  it('should set an alias with env file option', async () => {
    await flagService.run(['-s', '--env-file', 'test.env', '-k', 'test', '-c', 'echo', 'test2'])
    expect(setSpy).toHaveBeenCalledWith('env File', path.resolve('test.env'))
    expect(infoSpy).not.toHaveBeenCalledWith('flag usage:')
  })

  it('should log error if env file option is not valid', async () => {
    await flagService.run(['-s', '--env-file', '-k', 'test', '-c', 'echo test2'])
    expect(infoSpy).toHaveBeenCalledWith(`invalid value for env-file flag: undefined`)
    expect(infoSpy).toHaveBeenCalledWith('flag usage:')
  })

  it('should update existing alias', async () => {
    configServiceSpy.getAlias.and.returnValue(configServiceSpy.config.alias.test)
    await flagService.run(['-s', '-k', 'test', '-c', 'echo', 'test2 test3'])
    expect(infoSpy).toHaveBeenCalledWith('unset alias: test => echo')
    expect(infoSpy).not.toHaveBeenCalledWith('flag usage:')
  })

  it('should update existing alias with multiple command parts', async () => {
    configServiceSpy.getAlias.and.returnValue(configServiceSpy.config.alias.test2)
    await flagService.run(['-s', '-k', 'test2', '-c', 'echo test2 test3'])
    expect(infoSpy).toHaveBeenCalledWith('unset alias: test2 => echo test2')
    expect(infoSpy).toHaveBeenCalledWith('set alias: test2 => echo test2 test3')
    expect(infoSpy).not.toHaveBeenCalledWith('flag usage:')
  })

  it('should log error if alias is not valid', async () => {
    await flagService.run(['-s', '-k', '-c', 'echo test2'])
    expect(infoSpy).toHaveBeenCalledWith(`no value provided for key`)
    expect(infoSpy).toHaveBeenCalledWith('flag usage:')
  })

  it('should log error with no key provided', async () => {
    await flagService.run(['-s', '-c', 'echo test2'])
    expect(infoSpy).toHaveBeenCalledWith(`missing required flag(s): --key`)
    expect(infoSpy).toHaveBeenCalledWith('flag usage:')
  })

  it('should log error with no command provided', async () => {
    await flagService.run(['-s', '-k', 'test', '-c'])
    expect(infoSpy).toHaveBeenCalledWith(`no value provided for command`)
    expect(infoSpy).toHaveBeenCalledWith('flag usage:')
  })

  it('should set alias from single input with spaces', async () => {
    await flagService.run(['-s', '-k', 'test', '-c', 'echo test2'])

    const setAliasSpy = configServiceSpy.setAlias.and.callThrough()

    expect(setAliasSpy).toHaveBeenCalledWith('test', {
      options: {},
      command: ['echo', 'test2']
    })
    expect(infoSpy).toHaveBeenCalledWith('set alias: test => echo test2')
    expect(infoSpy).not.toHaveBeenCalledWith('flag usage:')
  })

  it('should add quotes to command', async () => {
    await flagService.run(['-s', '-q', '-k', 'test', '-c', 'echo', 'test 2'])
    expect(setSpy).toHaveBeenCalledWith('quote', true)
    expect(infoSpy).not.toHaveBeenCalledWith('flag usage:')
  })

  it('should log error if quote option is not valid', async () => {
    await flagService.run(['-s', '-q', 'test', '-k', 'test', '-c', 'echo', 'test'])
    expect(infoSpy).toHaveBeenCalledWith(`invalid value for quote: test`)
    expect(infoSpy).toHaveBeenCalledWith('flag usage:')
  })

  it('should log error if quote option is not valid with multiple values', async () => {
    await flagService.run(['-s', '-q', 'test', '-q', 'test3', 'test2', '-k', 'test', '-c', 'echo', 'test'])
    expect(infoSpy).toHaveBeenCalledWith(`invalid value for quote: test`)
  })

  it('should set flag with work-dir flag', async () => {
    await flagService.run(['-s', '--work-dir', 'c:/path/to/dir', '-k', 'test', '-c', 'echo', 'test2'])
    expect(setSpy).toHaveBeenCalledWith('work dir', jasmine.stringMatching(/c:[/\\]path[/\\]to[/\\]dir/))
    expect(infoSpy).not.toHaveBeenCalledWith('flag usage:')
  })

  it('should log error if work-dir flag is not valid', async () => {
    await flagService.run(['-s', '--work-dir', '-k', 'test', '-c', 'echo', 'test2'])
    expect(infoSpy).toHaveBeenCalledWith(`invalid value for work-dir flag: undefined`)
    expect(infoSpy).toHaveBeenCalledWith('flag usage:')
  })
})
