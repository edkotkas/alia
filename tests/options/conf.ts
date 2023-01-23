import { Log } from '../../src/logger'
import type { Action } from '../../src/models'
import type { ConfigService, GistService } from '../../src/services'
import { OptionService } from '../../src/services'

describe('Conf', () => {

  let optionService: OptionService
  let configServiceSpy: jasmine.SpyObj<ConfigService>
  let action: Action

  beforeEach(() => {
    configServiceSpy = jasmine.createSpyObj<ConfigService>('ConfigService', ['getSeparator', 'setSeparator', 'setGistId', 'setToken'])
    optionService = new OptionService(configServiceSpy, {} as GistService)

    action = optionService.flags.find(f => f.key === 'conf')?.action as unknown as Action

    spyOn(Log, 'info').and.callFake(() => ({}))
  })

  it('should fail when no modifiers provided', () => {
    expect(() => action({
      args: [],
      data: {},
      modifiers: {}
    })).toThrowError()
  })

  it('should log path', async () => {
    configServiceSpy.filePath = 'test'

    await action({
      args: [],
      data: {},
      modifiers: {
        path: '--path'
      }
    })

    expect(Log.info).toHaveBeenCalledOnceWith('Config path:', configServiceSpy.filePath)
  })

  describe('Separator', () => {
    it('should set separator to default when no data passed', async () => {
      configServiceSpy.getSeparator.and.returnValue('@')
      configServiceSpy.setSeparator.and.callFake(() => ({}))

      await action({
        args: [],
        data: {},
        modifiers: {
          separator: '--separator'
        }
      })

      expect(configServiceSpy.setSeparator).toHaveBeenCalledWith(undefined)
    })

    it('should set to specified string', async () => {
      configServiceSpy.setSeparator.and.callFake(() => ({}))

      await action({
        args: [],
        data: {
          separator: '--'
        },
        modifiers: {
          separator: '--separator=--'
        }
      })

      expect(configServiceSpy.setSeparator).toHaveBeenCalledWith('--')
    })
  })

  describe('Gist', () => {
    it('should throw error with no id', async () => {
      try {
        await action({
          args: [],
          data: {},
          modifiers: {
            gist: '--gist'
          }
        })

        fail()
      } catch(e) {
        expect(e).toEqual(new Error('No gist id provided'))
      }
    })

    it('should set to specified id', async () => {
      configServiceSpy.setGistId.and.callFake(() => ({}))

      await action({
        args: [],
        data: {
          gist: 'hgf1d56h159f1651'
        },
        modifiers: {
          gist: '--gist=hgf1d56h159f1651'
        }
      })

      expect(configServiceSpy.setGistId).toHaveBeenCalledWith('hgf1d56h159f1651')
    })
  })

  describe('Token', () => {
    it('should throw error when no token provided', async () => {
      try {
        await action({
          args: [],
          data: {},
          modifiers: {
            token: '--token'
          }
        })

        fail()
      } catch(e) {
        expect(e).toEqual(new Error('No token provided'))
      }
    })

    it('should set to specified id', async () => {
      configServiceSpy.setToken.and.callFake(() => ({}))

      await action({
        args: [],
        data: {
          token: 'hgf1d56h159f1651'
        },
        modifiers: {
          token: '--token=hgf1d56h159f1651'
        }
      })

      expect(configServiceSpy.setToken).toHaveBeenCalledWith('hgf1d56h159f1651')
    })
  })
})
