import type { ConfigService } from './config.service'
import type { GistService } from './gist.service'
import { FlagService } from './flag.service'
import logger from '../logger'

describe('FlagService', () => {
  let flagService: FlagService
  let infoSpy: jasmine.Spy
  let infoResult: (string | boolean)[][]
  let setSpy: jasmine.Spy

  const helpLine = [
    `
    usage:

      $ al [options] [alias] [separator] [command]

    options:
    `
  ]

  beforeEach(() => {
    infoResult = []
    infoSpy = spyOn(logger, 'info').and.callFake((...data: unknown[]) => {
      infoResult = [...infoResult, data as string[]]
    })
    setSpy = spyOn(logger, 'set').and.callFake(() => ({}))

    const configServiceSpy = jasmine.createSpyObj<ConfigService>('ConfigService', [
      'config',
      'separator',
      'getAlias',
      'setAlias',
      'save'
    ])
    configServiceSpy.separator = '@'
    configServiceSpy.config.alias = {}

    configServiceSpy.getAlias.and.returnValue(undefined)
    configServiceSpy.setAlias.and.callFake(() => ({}))

    flagService = new FlagService(configServiceSpy, {} as GistService)
    infoSpy.calls.reset()
  })

  it('should be defined', () => {
    expect(flagService).toBeDefined()
  })

  it('should return help with no input', async () => {
    await flagService.run([])
    expect(infoSpy).toHaveBeenCalled()
    expect(infoResult[0]).toEqual(helpLine)
  })

  it('should return help with valid flag', async () => {
    await flagService.run(['--help'])
    expect(infoSpy).toHaveBeenCalled()
    expect(infoResult[0]).toEqual(helpLine)
  })

  it('should return with non flag input', async () => {
    const result = await flagService.run(['test'])
    expect(result).toEqual(false)
  })

  it('should return with invalid flag', async () => {
    const result = await flagService.run(['--invalid'])
    expect(result).toEqual(false)
  })

  it('should throw error with invalid flag', async () => {
    await flagService.run(['-c', '--invalid'])
    expect(infoResult[0]).toEqual(['unknown flag: --invalid\navailable options:'])
  })

  it('should take in value for flag', async () => {
    await flagService.run(['-c', '-t', 'token'])
    expect(setSpy).toHaveBeenCalledOnceWith('token', 'token')
  })

  it('should take value with consecutive flags', async () => {
    await flagService.run(['-s', '-sh', '-e', 'test=test', 'key', '@', 'command'])
    expect(infoResult).toEqual([['\t', 'test=test'], ['set alias: key @ command']])
  })

  it('should set shell flag with value', async () => {
    await flagService.run(['-s', '-sh', 'false', 'key', '@', 'command'])
    expect(setSpy).toHaveBeenCalledOnceWith('shell', false)
  })

  it('should throw error with no env variables', async () => {
    const result = await flagService.run(['-s', '-e', 'key', '@', 'command'])
    expect(result).toEqual(true)
    expect(infoResult).toEqual([['invalid value for env']])
  })
})
