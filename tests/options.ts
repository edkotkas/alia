import type { ConfigService, GistService } from '../src/services'
import type { Action, ActionParameters } from '../src/models'
import { OptionService } from '../src/services'
import Log from '../src/logger'
import pkg from '../package.json' assert { type: 'json' }

describe('OptionService', () => {

  let optionService: OptionService
  let helpAction: Action
  let versionAction: Action
  let initAction: Action

  let configServiceSpy: jasmine.SpyObj<ConfigService>

  let infoSpy: jasmine.Spy

  beforeEach(() => {
    configServiceSpy = jasmine.createSpyObj<ConfigService>('ConfigService', ['getSeparator', 'init'])
    optionService = new OptionService(configServiceSpy)

    helpAction = optionService.flags.find(f => f.key === 'help')?.action as unknown as Action
    versionAction = optionService.flags.find(f => f.key === 'version')?.action as unknown as Action
    initAction = optionService.flags.find(f => f.key === 'init')?.action as unknown as Action

    infoSpy = spyOn(Log, 'info').and.callFake(() => ({}))
  })

  it('should have flags', () => {
    expect(optionService.flags).toBeDefined()
  })

  it('should show correct version', async () => {
    await versionAction({} as ActionParameters)

    expect(infoSpy).toHaveBeenCalledOnceWith(pkg.version)
  })

  it('should show help', async () => {
    await helpAction({} as ActionParameters)

    expect(infoSpy).toHaveBeenCalled()
  })

  it('should call init', async () => {
    await initAction({} as ActionParameters, configServiceSpy)

    const spy = configServiceSpy.init.and.resolveTo()

    expect(spy).toHaveBeenCalled()
  })


  it('should show help with no short flag or description', async () => {
    optionService.flags = [
      {
        action: (): Promise<void> => Promise.resolve(),
        key: 'noshort'
      }
    ]

    await helpAction({} as ActionParameters)

    expect(infoSpy).toHaveBeenCalledWith(`\t--noshort`)
  })
})
