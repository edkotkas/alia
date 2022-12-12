import { Log } from '../../src/logger'
import type { Action } from '../../src/models'
import type { ConfigService, GistService} from '../../src/services'
import {  OptionService } from '../../src/services'

describe('List', () => {

  let optionService: OptionService
  let configServiceSpy: jasmine.SpyObj<ConfigService>
  let action: Action
  
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
          separator: ''
        },
        alias: { 
          b: { 
            options: { 
              shell: false 
            }, 
            command: ['b'] }, 
            a: { 
              options: { 
                shell: false 
              },  
              command: ['a'] 
            }
          } 
      }
    })

    optionService = new OptionService(configServiceSpy, {} as GistService)

    action = optionService.flags.find(f => f.full === 'list')?.action as unknown as Action

    spyOn(Log, 'info').and.callFake(() => ({}))
  })

  it('should list alias', async () => {
    configServiceSpy.getSeparator.and.returnValue('--')

    await action({
      args: [],
      data: {},
      modifiers: {}
    })

    expect(Log.info).toHaveBeenCalledWith(`b \t-- \tb\na \t-- \ta`)
  })

  it('should list alias sorted', async () => {
    configServiceSpy.getSeparator.and.returnValue('--')

    await action({
      args: [],
      data: {},
      modifiers: {
        sort: '--sort'
      }
    })

    expect(Log.info).toHaveBeenCalledWith(`a \t-- \ta\nb \t-- \tb`)
  })
})