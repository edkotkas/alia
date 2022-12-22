import type { ConfigService, GistService} from '../src/services'
import { OptionService } from '../src/services'
import { Log } from '../src/logger'
import pkg from '../package.json' assert { type: 'json' }
import { Action, ActionParameters } from '../src/models'

describe('OptionService', () => {

  let optionService: OptionService
  let helpAction: Action
  let versionAction: Action

  beforeEach(() => {
    const configService = jasmine.createSpyObj<ConfigService>('ConfigService', ['getSeparator'])
    const gistService = jasmine.createSpyObj<GistService>('GistService', ['push', 'pull'])
    optionService = new OptionService(configService, gistService)

    helpAction = optionService.flags.find(f => f.full === 'help')?.action as unknown as Action
    versionAction = optionService.flags.find(f => f.full === 'version')?.action as unknown as Action

    spyOn(Log, 'info').and.callFake(() => ({}))
  })

  it('should have flags', () => {
    expect(optionService.flags).toBeDefined()
  })

  it('should show correct version', async () => {
    await versionAction({} as ActionParameters)

    expect(Log.info).toHaveBeenCalledOnceWith(pkg.version)
  })

  it('should show help', async () => {
    await helpAction({} as ActionParameters)

    expect(Log.info).toHaveBeenCalled()
  })
})
