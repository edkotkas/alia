import { ConfigService } from './config.service.js'

import fs from 'node:fs/promises'

import { FlagService } from './flag.service.js'
import logger from '../utils/logger.js'
import { clearProviders, inject, provide } from '../utils/di.js'

describe('FlagService', () => {
  let flagService: FlagService
  let infoSpy: jasmine.Spy
  let setSpy: jasmine.Spy
  let initSpy: jasmine.Spy
  let helpSnap: string

  beforeAll(async () => {
    helpSnap = await fs.readFile('snapshots/help', 'utf-8')
  })

  beforeEach(() => {
    infoSpy = spyOn(logger, 'info').and.callFake(() => ({}))
    setSpy = spyOn(logger, 'set').and.callFake(() => ({}))
    initSpy = spyOn(logger, 'init').and.callFake(() => ({}))

    const configServiceSpy = jasmine.createSpyObj<ConfigService>(
      'ConfigService',
      ['config', 'separator', 'getAlias', 'setAlias', 'save'],
      {
        isReady: true
      }
    )

    configServiceSpy.config.alias = {}

    configServiceSpy.getAlias.and.returnValue(undefined)
    configServiceSpy.setAlias.and.callFake(() => ({}))

    provide(ConfigService, configServiceSpy)

    flagService = inject(FlagService)
    infoSpy.calls.reset()
  })

  afterEach(() => {
    clearProviders()
  })

  it('should be defined', () => {
    expect(flagService).toBeDefined()
  })

  it('should return help with no input', async () => {
    const result = await flagService.run([])
    expect(result).toEqual(true)
    const helpParts = helpSnap.split('\n').filter((p) => p.trim().length > 0)
    helpParts.forEach((part) => {
      expect(infoSpy).toHaveBeenCalledWith(part)
    })
  })

  it('should return help with valid flag', async () => {
    await flagService.run(['--help'])
    const helpParts = helpSnap.split('\n').filter((p) => p.trim().length > 0)
    helpParts.forEach((part) => {
      expect(infoSpy).toHaveBeenCalledWith(part)
    })
  })

  it('should call logger init with no config', async () => {
    const spy = jasmine.createSpyObj<ConfigService>(
      'ConfigService',
      ['config', 'separator', 'getAlias', 'setAlias', 'save'],
      {
        isReady: false
      }
    )

    clearProviders()

    provide(ConfigService, spy)

    const flag = inject(FlagService)

    const result = await flag.run(['-c'])

    expect(result).toEqual(true)

    expect(initSpy).toHaveBeenCalledOnceWith()
  })

  it('should return with non flag input', async () => {
    const result = await flagService.run(['test'])
    expect(result).toEqual(false)
  })

  it('should return with invalid flag', async () => {
    const result = await flagService.run(['--invalid'])
    expect(result).toEqual(false)
  })

  it('should show error with invalid flag', async () => {
    const result = await flagService.run(['-c', '--invalid'])
    expect(result).toEqual(true)
    expect(infoSpy).toHaveBeenCalledWith('unknown flag: --invalid')
    expect(infoSpy).toHaveBeenCalledWith('flag usage:')
    expect(infoSpy).toHaveBeenCalledWith(jasmine.stringMatching(/^--conf, -c/))
    expect(infoSpy).toHaveBeenCalledWith(jasmine.stringMatching(/^\s--path, -p\t\tshow config file path$/))
  })

  it('should show error with invalid flag usage', async () => {
    const result = await flagService.run(['-s'])
    expect(result).toEqual(true)
    expect(infoSpy).toHaveBeenCalledWith('flag usage:')
    expect(infoSpy).toHaveBeenCalledWith(jasmine.stringMatching(/^--set, -s\s+set an alias/))
  })

  it('should not fail regex for flags', async () => {
    const result = await flagService.run(['-c', 'test--path'])
    expect(result).toEqual(true)
    expect(infoSpy).not.toHaveBeenCalled()
  })

  it('should have the correct amount of dashes', async () => {
    const result = await flagService.run(['-c', '-pp--path'])
    expect(result).toEqual(true)
    expect(infoSpy).toHaveBeenCalledWith('unknown flag: -pp--path')
  })

  it('should take in value for flag', async () => {
    await flagService.run(['-c', '-t', 'token'])
    expect(setSpy).toHaveBeenCalledOnceWith('token', 'token')
  })

  it('should take value with consecutive flags', async () => {
    await flagService.run(['-s', '-sh', '-e', 'test=test', '-k', 'key', '-c', 'command'])
    expect(infoSpy).toHaveBeenCalledWith('\t', 'test=test')
    expect(setSpy).toHaveBeenCalledWith('shell', true)
    expect(infoSpy).toHaveBeenCalledWith('set alias: key => command')
  })

  it('should set shell flag with value', async () => {
    await flagService.run(['-s', '-sh', 'false', '-k', 'key', '-c', 'command'])
    expect(setSpy).toHaveBeenCalledOnceWith('shell', false)
  })

  it('should throw error with no env variables', async () => {
    await flagService.run(['-s', '-e', '-k', 'key', '-c', 'command'])
    expect(infoSpy).toHaveBeenCalledWith(`invalid value for env flag: undefined`)
  })

  it('should throw error with missing required flags', async () => {
    await flagService.run(['-s', '-k', 'key'])
    expect(infoSpy).toHaveBeenCalledWith(`missing required flag(s): --command`)
  })

  it('should throw error with multiple missing required flags', async () => {
    await flagService.run(['-s'])
    expect(infoSpy).toHaveBeenCalledWith(`missing required flag(s): --key, --command`)
  })
})
