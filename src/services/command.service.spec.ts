import type { ConfigService } from './config.service'

import child from 'node:child_process'
import dotenv from 'dotenv'

import { CommandService } from './command.service'
import logger from '../logger'

describe('CommandService', () => {
  let commandService: CommandService

  let configServiceSpy: jasmine.SpyObj<ConfigService>

  let spawnSyncSpy: jasmine.Spy

  let infoSpy: jasmine.Spy

  let dotEnvSpy: jasmine.Spy

  beforeEach(() => {
    configServiceSpy = jasmine.createSpyObj<ConfigService>('ConfigService', ['getAlias'])
    configServiceSpy.getAlias.and.returnValue({
      command: ['echo'],
      options: {
        env: {
          TEST: 'test'
        }
      }
    })

    spawnSyncSpy = spyOn(child, 'spawnSync').and.returnValue({} as child.SpawnSyncReturns<Buffer>)

    dotEnvSpy = spyOn(dotenv, 'config').and.returnValue({
      parsed: {
        TEST: 'test'
      }
    })

    process.env = {}

    infoSpy = spyOn(logger, 'info')

    commandService = new CommandService(configServiceSpy)
  })

  it('should be defined', () => {
    expect(commandService).toBeDefined()
  })

  it('should run command', () => {
    commandService.run(['test'])

    expect(spawnSyncSpy).toHaveBeenCalledOnceWith('echo', [], {
      cwd: process.cwd(),
      shell: undefined,
      stdio: 'inherit',
      env: {
        TEST: 'test'
      }
    })
  })

  it('should throw error with no arguments', () => {
    expect(() => commandService.run([])).toThrowError('No arguments provided for command')
  })

  it('should log info with no alias', () => {
    configServiceSpy.getAlias.and.returnValue(undefined)

    commandService.run(['test'])

    expect(infoSpy).toHaveBeenCalledOnceWith('Alias not set: test')
  })

  it('should run command with env file', () => {
    configServiceSpy.getAlias.and.returnValue({
      command: ['echo'],
      options: {
        envFile: '.env'
      }
    })

    commandService.run(['test'])

    expect(spawnSyncSpy).toHaveBeenCalledOnceWith('echo', [], {
      cwd: process.cwd(),
      shell: undefined,
      stdio: 'inherit',
      env: {
        TEST: 'test'
      }
    })
  })

  it('should throw error with no env file', () => {
    configServiceSpy.getAlias.and.returnValue({
      command: ['echo'],
      options: {
        envFile: '.env'
      }
    })

    dotEnvSpy.and.returnValue({
      error: new Error('test')
    })

    expect(() => commandService.run(['test'])).toThrowError('test')
  })

  it('should run command with shell', () => {
    configServiceSpy.getAlias.and.returnValue({
      command: ['echo'],
      options: {
        shell: true
      }
    })

    commandService.run(['test'])

    expect(spawnSyncSpy).toHaveBeenCalledOnceWith('echo', [], {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: true,
      env: {}
    })
  })

  it('should run command with env file and shell', () => {
    configServiceSpy.getAlias.and.returnValue({
      command: ['echo'],
      options: {
        envFile: '.env',
        shell: true
      }
    })

    commandService.run(['test'])

    expect(spawnSyncSpy).toHaveBeenCalled()
  })

  it('should run command with arguments', () => {
    configServiceSpy.getAlias.and.returnValue({
      command: ['echo'],
      options: {
        quote: true
      }
    })

    commandService.run(['test', 'test test'])

    expect(spawnSyncSpy).toHaveBeenCalledOnceWith('echo', ['"test test"'], {
      cwd: process.cwd(),
      shell: undefined,
      stdio: 'inherit',
      env: {}
    })
  })
})
