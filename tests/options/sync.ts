import type { Action, ActionParameters } from '../../src/models'
import type { ConfigService, GistService} from '../../src/services'
import { OptionService } from '../../src/services'

describe('Sync', () => {

  let optionService: OptionService
  let gistServiceSpy: jasmine.SpyObj<GistService>
  let action: Action

  beforeEach(() => {
    gistServiceSpy = jasmine.createSpyObj<GistService>('GistService', ['pull', 'push'])
    optionService = new OptionService({} as ConfigService, gistServiceSpy)
    action = optionService.flags.find(f => f.key === 'sync')?.action as unknown as Action
  })

  it('should pull when no arguments passed', async () => {
    gistServiceSpy.pull.and.resolveTo()

    await action({
      args: [],
      data: {},
      modifiers: {}
    })

    expect(gistServiceSpy.pull).toHaveBeenCalled()
  })

  it('should pull', async () => {
    gistServiceSpy.pull.and.resolveTo()

    await action({
      args: [],
      data: {},
      modifiers: {
        pull: '--pull'
      }
    })

    expect(gistServiceSpy.pull).toHaveBeenCalled()
  })

  it('should push', async () => {
    gistServiceSpy.push.and.resolveTo()

    await action({
      args: [],
      data: {},
      modifiers: {
        push: '--push'
      }
    })

    expect(gistServiceSpy.push).toHaveBeenCalled()
  })

  it('should throw error', async () => {
    gistServiceSpy.push.and.resolveTo()

    try {
      await action({
        args: [],
        data: {},
        modifiers: {
          a: '--a'
        }
      } as ActionParameters)

      fail()
    } catch (e) {
      expect(e).toEqual(new Error('Invalid arguments passed'))
    }
  })
})
