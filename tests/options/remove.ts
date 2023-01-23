import { Log } from '../../src/logger'
import type { Action, ActionParameters } from '../../src/models'
import type { ConfigService, GistService} from '../../src/services'
import {  OptionService } from '../../src/services'

describe('Remove', () => {

  let optionService: OptionService
  let configServiceSpy: jasmine.SpyObj<ConfigService>
  let action: Action

  beforeEach(() => {
    configServiceSpy = jasmine.createSpyObj<ConfigService>('ConfigService', ['getAlias', 'removeAlias', 'setGistId', 'setToken'])
    optionService = new OptionService(configServiceSpy, {} as GistService)
    action = optionService.flags.find(f => f.key === 'remove')?.action as unknown as Action
    spyOn(Log, 'info').and.callFake(() => ({}))
  })

  it('should remove alias', async () => {
    configServiceSpy.getAlias.and.returnValue({
      options: {
        shell: false
      },
      command: ['command', 'test']
    })

    configServiceSpy.removeAlias.and.callFake(() => ({}))

    await action({
      args: [''],
      data: {},
      modifiers: {}
    } as ActionParameters)

    expect(configServiceSpy.removeAlias).toHaveBeenCalled()
  })

  it('should fail to remove alias', async () => {
    configServiceSpy.getAlias.and.returnValue(undefined)
    configServiceSpy.removeAlias.and.callFake(() => ({}))

    try {
      await action({
        args: [''],
        data: {},
        modifiers: {}
      } as ActionParameters)

      fail()
    } catch (e) {
      expect(e).toEqual(new Error(`Alias '' does not exist`))
    }
  })
})
