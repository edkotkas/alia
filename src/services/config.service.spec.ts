import { file } from '../utils/file.js'
import { ConfigService } from './config.service.js'
import logger from '../utils/logger.js'
import type { Command } from '../models/config.model.js'
import { read } from '../utils/read.js'
import defaultConfig from '../../data/config.default.json' with { type: 'json' }
import { clearProviders, inject } from '../utils/di.js'

describe('ConfigService', () => {
  let configService: ConfigService

  let writeSpy: jasmine.Spy
  let readSpy: jasmine.Spy
  let existsSpy: jasmine.Spy
  let questionSpy: jasmine.Spy
  let infoSpy: jasmine.Spy

  let originalPlatform: NodeJS.Platform

  beforeEach(() => {
    infoSpy = spyOn(logger, 'info').and.callFake(() => ({}))
    writeSpy = spyOn(file, 'write').and.callFake(() => ({}))
    readSpy = spyOn(file, 'read').and.callFake(() => '{}')
    existsSpy = spyOn(file, 'exists').and.returnValue(true)
    questionSpy = spyOn(read, 'question').and.resolveTo('')

    originalPlatform = process.platform

    configService = inject(ConfigService)
  })

  afterEach(() => {
    Object.defineProperty(process, 'platform', {
      value: originalPlatform
    })

    clearProviders()
  })

  it('should be defined', () => {
    expect(configService).toBeDefined()
  })

  it('should get config', () => {
    readSpy.and.returnValue('{}')
    expect(configService.config).toBeDefined()
  })

  it('should get alias', () => {
    readSpy.and.returnValue('{"alias": {"test": "echo test"}}')
    expect(configService.alias).toBeDefined()
  })

  it('should get keys', () => {
    readSpy.and.returnValue('{"alias": {"test": "echo test"}}')
    expect(configService.keys).toBeDefined()
  })

  it('should get options', () => {
    readSpy.and.returnValue('{"options": {"separator": "@"}}')
    expect(configService.options).toBeDefined()
  })

  it('should get isReady as true', () => {
    readSpy.and.returnValue('{}')
    expect(configService.isReady).toBeTruthy()
  })

  it('should return default config on error', () => {
    readSpy.and.callFake((path: string) => {
      if (path.endsWith(configService.fileName)) {
        throw new Error('error')
      } else {
        return '{ "version": "1.0.0" }'
      }
    })
    expect(configService.config).toEqual(configService.defaultConfig)
  })

  it('should get shell', () => {
    readSpy.and.returnValue('{"options": {"shell": true}}')
    expect(configService.shell).toBeDefined()
  })

  it('should set shell', () => {
    readSpy.and.returnValue('{"options": {"shell": true}}')
    configService.shell = false
    expect(writeSpy).toHaveBeenCalledOnceWith(configService.filePath, { options: { shell: false } })
  })

  it('should get separator', () => {
    readSpy.and.returnValue('{"options": {"separator": "@"}}')
    expect(configService.separator).toBeDefined()
  })

  it('should set separator', () => {
    readSpy.and.returnValue('{"options": {"separator": "@"}}')
    configService.separator = '#'
    expect(writeSpy).toHaveBeenCalledOnceWith(configService.filePath, { options: { separator: '#' } })
  })

  it('should get alias', () => {
    readSpy.and.returnValue('{"alias": {"test": {"command": ["echo", "alia", "is", "working!"]}}}')
    expect(configService.getAlias('test')).toBeDefined()
  })

  it('should set alias', () => {
    const config = { alias: { test: { command: ['echo', 'alia', 'is', 'working!'] } } }
    readSpy.and.callFake(() => JSON.stringify({ alias: {} }))
    configService.setAlias('test', { command: ['echo', 'alia', 'is', 'working!'] } as Command)
    expect(writeSpy).toHaveBeenCalledOnceWith(configService.filePath, config)
  })

  it('should remove alias', () => {
    const config = { alias: { test: { command: ['echo', 'alia', 'is', 'working!'] } } }
    readSpy.and.returnValue(JSON.stringify(config))
    configService.removeAlias('test')
    expect(writeSpy).toHaveBeenCalledOnceWith(configService.filePath, { alias: {} })
  })

  it('should get token', () => {
    readSpy.and.returnValue(JSON.stringify({ meta: { gist: { token: 'token' } } }))
    expect(configService.token).toEqual('token')
  })

  it('should set token', () => {
    readSpy.and.returnValue(JSON.stringify({ meta: { gist: {} } }))
    configService.token = 'newToken'
    expect(writeSpy).toHaveBeenCalledOnceWith(configService.filePath, { meta: { gist: { token: 'newToken' } } })
  })

  it('should get gistId', () => {
    readSpy.and.returnValue(JSON.stringify({ meta: { gist: { id: 'gistId' } } }))
    expect(configService.gistId).toEqual('gistId')
  })

  it('should set gistId', () => {
    readSpy.and.returnValue(JSON.stringify({ meta: { gist: {} } }))
    configService.gistId = 'newGistId'
    expect(writeSpy).toHaveBeenCalledOnceWith(configService.filePath, { meta: { gist: { id: 'newGistId' } } })
  })

  it('should init', async () => {
    existsSpy.and.returnValue(false)
    readSpy.and.returnValue(JSON.stringify({}))
    await configService.init()
    expect(writeSpy).toHaveBeenCalledOnceWith(configService.filePath, configService.defaultConfig)
  })

  it('should get default config', () => {
    readSpy.and.callThrough()
    expect(configService.defaultConfig).toEqual(defaultConfig)
  })

  it('should init with existing config', async () => {
    readSpy.and.returnValue(JSON.stringify({}))
    const spy = questionSpy.and.resolveTo('y')
    await configService.init()

    expect(spy).toHaveBeenCalledOnceWith(jasmine.anything(), jasmine.stringContaining('config already exists'))
    expect(writeSpy).toHaveBeenCalled()
    expect(infoSpy).toHaveBeenCalledWith(
      jasmine.stringContaining('backup created:'),
      jasmine.stringMatching(/\.alia\.json\.backup-\d+/)
    )
    expect(infoSpy).toHaveBeenCalledWith(
      jasmine.stringContaining('created config'),
      jasmine.stringContaining('.alia.json')
    )
  })

  it('should init with existing config', async () => {
    readSpy.and.returnValue(JSON.stringify({}))
    questionSpy.and.returnValue(Promise.resolve('x'))
    await configService.init()
    expect(writeSpy).not.toHaveBeenCalled()
  })

  it('should set config shell based on platform', () => {
    readSpy.and.returnValue(JSON.stringify({ options: {} }))

    Object.defineProperty(process, 'platform', {
      value: 'win32'
    })

    const service = inject(ConfigService)
    expect(service.shell).toBeTrue()

    Object.defineProperty(process, 'platform', {
      value: 'linux'
    })

    const service2 = inject(ConfigService)
    expect(service2.shell).toBeFalse()
  })
})
