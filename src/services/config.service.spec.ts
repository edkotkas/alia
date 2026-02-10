import path from 'node:path'
import defaultConfig from '../../data/config.default.json' with { type: 'json' }
import type { Command } from '../models/config.model.js'
import { clearProviders, inject } from '../utils/di.js'
import { file } from '../utils/file.js'
import logger from '../utils/logger.js'
import { read } from '../utils/read.js'
import { ConfigService } from './config.service.js'

describe('ConfigService', () => {
  let configService: ConfigService

  let writeSpy: jasmine.Spy
  let readSpy: jasmine.Spy
  let existsSpy: jasmine.Spy
  let questionSpy: jasmine.Spy
  let infoSpy: jasmine.Spy
  let errorSpy: jasmine.Spy

  let originalPlatform: NodeJS.Platform

  beforeEach(() => {
    infoSpy = spyOn(logger, 'info').and.callFake(() => ({}))
    writeSpy = spyOn(file, 'write').and.callFake(() => ({}))
    readSpy = spyOn(file, 'read').and.callFake(() => '{}')
    existsSpy = spyOn(file, 'exists').and.returnValue(true)
    questionSpy = spyOn(read, 'question').and.resolveTo('')
    errorSpy = spyOn(logger, 'error').and.callFake(() => ({}))

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

  it('should have alias', () => {
    readSpy.and.returnValue('{"alias": {"test": "echo test"}}')
    expect(configService.alias).toBeDefined()
  })

  it('should get keys', () => {
    readSpy.and.returnValue('{"alias": {"test": "echo test"}}')
    expect(configService.keys).toBeDefined()
  })

  it('should get options', () => {
    readSpy.and.returnValue('{"options": {}}')
    expect(configService.options).toBeDefined()
  })

  it('should get isReady as true', () => {
    readSpy.and.returnValue('{}')
    expect(configService.isReady).toBeTruthy()
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

  it('should get alias', () => {
    readSpy.and.returnValue('{"alias": {"test": {"command": ["echo", "alia", "is", "working!"]}}}')
    expect(configService.getAlias('test')).toBeDefined()
  })

  it('should set alias', () => {
    const config = { alias: { test: { command: ['echo', 'alia', 'is', 'working!'] } } }
    readSpy.and.callFake(() => JSON.stringify({ alias: {} }))
    configService.setAlias('test', config.alias.test as Command)
    expect(writeSpy).toHaveBeenCalledOnceWith(configService.filePath, config)
  })

  it('should set alias to project config if exists', () => {
    const projectPath = path.join(process.cwd(), configService.fileName)

    existsSpy.and.callFake((candidate: string) => [configService.filePath, projectPath].includes(candidate))

    const config = { alias: { test: { command: ['echo', 'local'] }, local: { command: ['echo', 'local'] } } }
    readSpy.and.callFake((candidate: string) => {
      if (candidate === projectPath) {
        return JSON.stringify({
          alias: { local: { command: ['echo', 'local'] } }
        })
      }

      return JSON.stringify({})
    })

    configService.setAlias('test', config.alias.local as Command, true)
    expect(writeSpy).toHaveBeenCalledOnceWith(projectPath, config)
  })

  it('should throw error if project config does not exist when setting project alias', () => {
    existsSpy.and.returnValue(false)

    expect(() => configService.setAlias('test', {} as Command, true)).toThrowError(
      'no config file found in current directory or any parent directories'
    )
  })

  it('should remove alias', () => {
    const config = { alias: { test: { command: ['echo', 'alia', 'is', 'working!'] } } }
    readSpy.and.returnValue(JSON.stringify(config))
    configService.removeAlias('test')
    expect(writeSpy).toHaveBeenCalledOnceWith(configService.filePath, { alias: {} })
  })

  it('should remove alias from global if project config does not exist', () => {
    existsSpy.and.callFake((candidate: string) => candidate === configService.filePath)
    const config = { alias: {} }

    readSpy.and.callFake(() => {
      return JSON.stringify({ alias: { test: { command: ['echo', 'alia', 'is', 'working!'] } } })
    })

    configService.removeAlias('test')
    expect(writeSpy).toHaveBeenCalledOnceWith(configService.filePath, config)
  })

  it('should remove alias from project config if exists', () => {
    const projectPath = path.join(process.cwd(), configService.fileName)

    existsSpy.and.callFake((candidate: string) => [projectPath].includes(candidate))

    const config = { alias: { local: { command: ['echo', 'local'] } } }

    readSpy.and.callFake((candidate: string) => {
      if (candidate === projectPath) {
        return JSON.stringify({
          alias: { test: { command: ['echo', 'local'] }, local: { command: ['echo', 'local'] } }
        })
      }

      return JSON.stringify({})
    })

    configService.removeAlias('test', true)
    expect(writeSpy).toHaveBeenCalledOnceWith(projectPath, config)
  })

  it('should throw error if project config does not exist when removing project alias', () => {
    existsSpy.and.returnValue(false)

    expect(() => configService.removeAlias('test', true)).toThrowError(
      'no config file found in current directory or any parent directories'
    )
  })

  it('should fail to read config file when updating alias', () => {
    readSpy.and.returnValue('invalid json')
    configService.setAlias('test', {} as Command)
    expect(errorSpy).toHaveBeenCalledWith(new Error('failed to read config file'))
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

  it('should set token and create meta if not exist', () => {
    readSpy.and.returnValue(JSON.stringify({}))
    configService.token = 'newToken'
    expect(writeSpy).toHaveBeenCalledOnceWith(configService.filePath, { meta: { gist: { token: 'newToken', id: '' } } })
  })

  it('should get undefined if token is not set', () => {
    readSpy.and.returnValue(JSON.stringify({}))
    expect(configService.token).toBeUndefined()
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

  it('should set gistId and create meta if it does not exist', () => {
    readSpy.and.returnValue(JSON.stringify({}))
    configService.gistId = 'newGistId'
    expect(writeSpy).toHaveBeenCalledOnceWith(configService.filePath, {
      meta: { gist: { token: '', id: 'newGistId' } }
    })
  })

  it('should get undefined if gistId is not set', () => {
    readSpy.and.returnValue(JSON.stringify({}))
    expect(configService.gistId).toBeUndefined()
  })

  it('should init', async () => {
    existsSpy.and.returnValue(false)
    readSpy.and.returnValue(JSON.stringify({}))
    await configService.init()
    expect(infoSpy).toHaveBeenCalledWith('created config:', configService.filePath)
    expect(writeSpy).toHaveBeenCalledOnceWith(configService.filePath, configService.defaultConfig)
  })

  it('should not init with force flag when config already exists', async () => {
    readSpy.and.returnValue(JSON.stringify({}))
    await configService.init(true)
    expect(writeSpy).not.toHaveBeenCalled()
  })

  it('should init with force flag when config does not exist', async () => {
    existsSpy.and.returnValue(false)

    await configService.init(true)
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
      jasmine.stringContaining('config reset'),
      jasmine.stringContaining('.alia.json')
    )
  })

  it('should not init with existing config', async () => {
    readSpy.and.returnValue(JSON.stringify({}))
    questionSpy.and.resolveTo('x')

    await configService.init()

    expect(writeSpy).not.toHaveBeenCalled()
  })

  it('should not init on main if config exists', async () => {
    readSpy.and.returnValue(JSON.stringify({}))
    await configService.init(true)
    expect(questionSpy).not.toHaveBeenCalled()
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

  it('should merge project config when present', () => {
    const root = path.parse(process.cwd()).root
    const cwdSpy = spyOn(process, 'cwd').and.returnValue(path.join(root, 'project'))
    const projectPath = path.join(cwdSpy(), configService.fileName)

    existsSpy.and.callFake((candidate: string) => [configService.filePath, projectPath].includes(candidate))

    readSpy.and.callFake((candidate: string) => {
      if (candidate === configService.filePath) {
        return JSON.stringify({
          options: { shell: false },
          alias: { global: { command: ['echo', 'global'] } }
        })
      }

      if (candidate === projectPath) {
        return JSON.stringify({
          options: { shell: true },
          alias: { local: { command: ['echo', 'local'] } }
        })
      }

      return JSON.stringify({})
    })

    const config = configService.config

    expect(config.options.shell).toBeTrue()
    expect(config.alias.global).toBeDefined()
    expect(config.alias.local).toBeDefined()
  })

  it('should return base config if project config not present', () => {
    existsSpy.and.callFake((candidate: string) => [configService.filePath].includes(candidate))
    readSpy.and.callFake((candidate: string) => {
      if (candidate === configService.filePath) {
        return JSON.stringify({
          options: { shell: false },
          alias: { global: { command: ['echo', 'global'] } }
        })
      }
    })

    const config = configService.config

    expect(config.options.shell).toBeFalse()
    expect(config.alias.global).toBeDefined()
    expect(config.alias.local).toBeUndefined()
  })

  it('should return default config if project and global config not present', () => {
    existsSpy.and.returnValue(false)
    readSpy.and.returnValue(JSON.stringify({}))

    const config = configService.config
    expect(config).toEqual(configService.defaultConfig)
  })
})
