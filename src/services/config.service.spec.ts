import { file } from '../utils/file'
import { ConfigService } from './config.service'
import logger from '../logger'
import type { Command } from '../models/config.model'
import { read } from '../utils/read'

describe('ConfigService', () => {
  let configService: ConfigService

  let writeSpy: jasmine.Spy
  let readSpy: jasmine.Spy
  let existsSpy: jasmine.Spy
  let questionSpy: jasmine.Spy

  beforeEach(() => {
    spyOn(logger, 'info').and.callFake(() => ({}))
    writeSpy = spyOn(file, 'write').and.callFake(() => ({}))
    readSpy = spyOn(file, 'read').and.callFake(() => '{}')
    existsSpy = spyOn(file, 'exists').and.callFake(() => true)
    questionSpy = spyOn(read, 'question').and.callFake(() => Promise.resolve(''))

    configService = new ConfigService()
  })

  it('should be defined', () => {
    expect(configService).toBeDefined()
  })

  it('should get config', () => {
    expect(configService.config).toBeDefined()
  })

  it('should throw error reading config', () => {
    readSpy.and.throwError('error')
    expect(() => configService.config).toThrowError('error')
  })

  it('should get shell', () => {
    readSpy.and.callFake(() => '{"options": {"shell": true}}')
    expect(configService.shell).toBeDefined()
  })

  it('should set shell', () => {
    readSpy.and.callFake(() => JSON.stringify({ options: { shell: true } }))
    configService.shell = false
    expect(writeSpy).toHaveBeenCalledOnceWith(configService.filePath, { options: { shell: false } })
  })

  it('should get separator', () => {
    readSpy.and.callFake(() => '{"options": {"separator": "@"}}')
    expect(configService.separator).toBeDefined()
  })

  it('should set separator', () => {
    readSpy.and.callFake(() => JSON.stringify({ options: { separator: '@' } }))
    configService.separator = '#'
    expect(writeSpy).toHaveBeenCalledOnceWith(configService.filePath, { options: { separator: '#' } })
  })

  it('should get alias', () => {
    readSpy.and.callFake(() => '{"alias": {"test": {"command": ["echo", "alia", "is", "working!"]}}}')
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
    readSpy.and.callFake(() => JSON.stringify(config))
    configService.removeAlias('test')
    expect(writeSpy).toHaveBeenCalledOnceWith(configService.filePath, { alias: {} })
  })

  it('should get token', () => {
    readSpy.and.callFake(() => JSON.stringify({ meta: { gist: { token: 'token' } } }))
    expect(configService.token).toEqual('token')
  })

  it('should set token', () => {
    readSpy.and.callFake(() => JSON.stringify({ meta: { gist: {} } }))
    configService.token = 'newToken'
    expect(writeSpy).toHaveBeenCalledOnceWith(configService.filePath, { meta: { gist: { token: 'newToken' } } })
  })

  it('should get gistId', () => {
    readSpy.and.callFake(() => JSON.stringify({ meta: { gist: { id: 'gistId' } } }))
    expect(configService.gistId).toEqual('gistId')
  })

  it('should set gistId', () => {
    readSpy.and.callFake(() => JSON.stringify({ meta: { gist: {} } }))
    configService.gistId = 'newGistId'
    expect(writeSpy).toHaveBeenCalledOnceWith(configService.filePath, { meta: { gist: { id: 'newGistId' } } })
  })

  it('should init', async () => {
    existsSpy.and.callFake(() => false)
    readSpy.and.callFake(() => JSON.stringify({}))
    await configService.init()
    expect(writeSpy).toHaveBeenCalledOnceWith(configService.filePath, configService.defaultConfig)
  })

  it('should init with existing config', async () => {
    readSpy.and.callFake(() => JSON.stringify({}))
    questionSpy.and.callFake(() => Promise.resolve('y'))
    await configService.init()
    expect(writeSpy).toHaveBeenCalled()
  })

  it('should init with existing config', async () => {
    readSpy.and.callFake(() => JSON.stringify({}))
    questionSpy.and.callFake(() => Promise.resolve('x'))
    await configService.init()
    expect(writeSpy).not.toHaveBeenCalled()
  })
})
