import Log from '../../src/logger'
import type { Action } from '../../src/models'
import type { ConfigService, GistService } from '../../src/services'
import { OptionService } from '../../src/services'

describe('List', () => {

  let optionService: OptionService
  let configServiceSpy: jasmine.SpyObj<ConfigService>
  let action: Action

  let infoSpy: jasmine.Spy

  beforeEach(() => {
    configServiceSpy = jasmine.createSpyObj<ConfigService>('ConfigService', ['getSeparator'], {
      config: {
        version: 1,
        meta: {
          gist: {
            id: '',
            token: ''
          }
        },
        options: {
          separator: '',
          shell: false,
          verbose: false
        },
        alias: {
          b: {
            options: {
              shell: false
            },
            command: ['b']
          },
          a: {
            options: {
              shell: false
            },
            command: ['a']
          }
        }
      }
    })

    optionService = new OptionService(configServiceSpy)

    action = optionService.flags.find(f => f.key === 'list')?.action as unknown as Action

    infoSpy = spyOn(Log, 'info').and.callFake(() => ({}))
  })

  it('should list alias', async () => {
    configServiceSpy.getSeparator.and.returnValue('--')

    await action({
      args: [],
      data: {},
      modifiers: {}
    }, configServiceSpy)

    expect(infoSpy).toHaveBeenCalledWith(`b \t-- \tb\na \t-- \ta`)
  })

  it('should list alias sorted', async () => {
    configServiceSpy.getSeparator.and.returnValue('--')

    await action({
      args: [],
      data: {},
      modifiers: {
        sort: '--sort'
      }
    }, configServiceSpy)

    expect(infoSpy).toHaveBeenCalledWith(`a \t-- \ta\nb \t-- \tb`)
  })

  
  it('should list filtered alias', async () => {
    configServiceSpy.getSeparator.and.returnValue('--')

    await action({
      args: [],
      data: {
        filter: ['a']
      },
      modifiers: {
        filter: '--filter'
      }
    }, configServiceSpy)

    expect(infoSpy).toHaveBeenCalledWith(`a \t-- \ta`)
  })

  it('should throw exception when no filter provided', async () => {
    configServiceSpy.getSeparator.and.returnValue('--')

    try {
      await action({
        args: [],
        data: {},
        modifiers: {
          filter: '--filter'
        }
      }, configServiceSpy)
    } catch(e) {
      expect(e).toEqual(new Error('No filter provided'))
    }
  })

  it('should list raw alias', async () => {
    configServiceSpy.getSeparator.and.returnValue('--')

    await action({
      args: [],
      data: {},
      modifiers: {
        raw: '--raw'
      }
    }, configServiceSpy)

    const result = JSON.stringify({
      b: {
        options: {
          shell: false
        },
        command: ['b']
      },
      a: {
        options: {
          shell: false
        },
        command: ['a']
      }
    }, null, 2)

    expect(infoSpy).toHaveBeenCalledWith(result)
  })
})
