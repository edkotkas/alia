import type { Action, ActionParameters } from '../../src/models'
import type { ConfigService, GistService} from '../../src/services'
import { OptionService } from '../../src/services'

describe('Sync', () => {

  let optionService: OptionService
  let gistServiceSpy: jasmine.SpyObj<GistService>
  let action: Action

  beforeEach(() => {
    gistServiceSpy = jasmine.createSpyObj<GistService>('GistService', ['pull', 'push'])
    optionService = new OptionService({} as ConfigService)
    action = optionService.flags.find(f => f.key === 'sync')?.action as unknown as Action
  })

  it('should pull when no arguments passed', async () => {
    const spy = gistServiceSpy.pull.and.resolveTo()

    await action({
      args: [],
      data: {},
      modifiers: {}
    }, undefined, gistServiceSpy)

    expect(spy).toHaveBeenCalled()
  })

  it('should pull', async () => {
    const spy = gistServiceSpy.pull.and.resolveTo()

    await action({
      args: [],
      data: {},
      modifiers: {
        pull: '--pull'
      }
    }, undefined, gistServiceSpy)

    expect(spy).toHaveBeenCalled()
  })

  it('should push', async () => {
    const spy = gistServiceSpy.push.and.resolveTo()

    await action({
      args: [],
      data: {},
      modifiers: {
        push: '--push'
      }
    }, undefined, gistServiceSpy)

    expect(spy).toHaveBeenCalled()
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
      } as ActionParameters, undefined, gistServiceSpy)

      fail()
    } catch (e) {
      expect(e).toEqual(new Error('Invalid arguments passed'))
    }
  })
})
