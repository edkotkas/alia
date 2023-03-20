import Log from '../../src/logger'
import type { Action } from '../../src/models'
import type { ConfigService,  GistService} from '../../src/services'
import {  OptionService } from '../../src/services'

describe('Set', () => {

  let optionService: OptionService
  let configServiceSpy: jasmine.SpyObj<ConfigService>
  let action: Action

  let infoSpy: jasmine.Spy

  beforeEach(() => {
    configServiceSpy = jasmine.createSpyObj<ConfigService>('ConfigService', ['getSeparator', 'getAlias', 'setAlias'])
    optionService = new OptionService(configServiceSpy, {} as GistService)
    action = optionService.flags.find(f => f.key === 'set')?.action as unknown as Action

    configServiceSpy.getSeparator.and.returnValue('--')

    infoSpy = spyOn(Log, 'info').and.callFake(() => ({}))
  })

  it('should throw error when no separator', async () => {
    try {
      await action({
        args: [''],
        data: {},
        modifiers: {}
      })

      fail()
    } catch(e) { 
      expect(e).toEqual(new Error(`Invalid Input, missing separator: '--'`))
    }
  })

  it('should throw error when no key or command', async () => {
    try {
      await action({
        args: ['--'],
        data: {},
        modifiers: {}
      })

      fail()
    } catch(e) { 
      expect(e).toEqual(new Error('Invalid arguments passed'))
    }
  })

  it('should set new alias', async () => {
    configServiceSpy.getAlias.and.returnValue(undefined)
    const spy = configServiceSpy.setAlias.and.callFake(() => ({}))

    await action({
      args: ['echo', '--', 'test'],
      data: {},
      modifiers: {}
    })

    expect(spy).toHaveBeenCalled()
    expect(infoSpy).toHaveBeenCalled()
  })

  it('should update existing alias', async () => {
    configServiceSpy.getAlias.and.returnValue({
      options: {
        shell: false
      },
      command: ['echo', '--', 'test']
    })

    const spy = configServiceSpy.setAlias.and.callFake(() => ({}))

    await action({
      args: ['echo', '--', 'other'],
      data: {},
      modifiers: {}
    })

    expect(spy).toHaveBeenCalled()
    expect(infoSpy).toHaveBeenCalledTimes(2)
  })

  it('should set alias with env variable', async () => {
    configServiceSpy.getAlias.and.returnValue(undefined)
    const spy = configServiceSpy.setAlias.and.callFake(() => ({}))
    process.env = {}

    await action({
      args: ['echo', '--', 'other'],
      data: {
        env: ['test=123']
      },
      modifiers: {
        env: '--env',
        shell: '--shell'
      }
    })

    expect(spy).toHaveBeenCalledOnceWith('echo', {
      options: {
        shell: true,
        env: {
          test: '123'
        }
      },
      command: ['other']
    })
    expect(infoSpy).toHaveBeenCalledTimes(3)
  })
})
