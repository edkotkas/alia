import type { CommandService, OptionService } from '../src/services'
import { InputService } from '../src/services'

describe('InputService', () => {

  let inputService: InputService
  let optionServiceSpy: jasmine.SpyObj<OptionService>
  let commandServiceSpy: jasmine.SpyObj<CommandService>

  let confActionSpy: jasmine.Spy

  beforeEach(() => {
    process.argv = ['', '']

    confActionSpy = jasmine.createSpy('confAction')

    optionServiceSpy = jasmine.createSpyObj<OptionService>('OptionService', ['help'], {
      flags: [
        { full: 'conf', short: 'c', modifiers: ['token', 'gist'], action: confActionSpy }
      ]
    })

    commandServiceSpy = jasmine.createSpyObj<CommandService>('CommandService', ['run'])
    commandServiceSpy.run.and.callFake(() => undefined)

    inputService = new InputService(optionServiceSpy, commandServiceSpy)
  })

  it('should process single params', async () => {
    process.argv.push('--conf', '--token=43243gfdsbfdg433g43')

    await inputService.read()

    expect(confActionSpy)
      .toHaveBeenCalledOnceWith({
        args: ['--token=43243gfdsbfdg433g43'],
        data: { token: '43243gfdsbfdg433g43' },
        modifiers: { token: '--token=43243gfdsbfdg433g43' }
      })
  })

  it('should process multiple params', async () => {
    process.argv.push('--conf', '--token=43243gfdsbfdg433g43', '--gist=gh_r422g4g2g')

    await inputService.read()

    expect(confActionSpy)
      .toHaveBeenCalledOnceWith({
        args: ['--token=43243gfdsbfdg433g43', '--gist=gh_r422g4g2g'],
        data: { token: '43243gfdsbfdg433g43', gist: 'gh_r422g4g2g' },
        modifiers: { token: '--token=43243gfdsbfdg433g43', gist: '--gist=gh_r422g4g2g' }
      })
  })

  it('should only process valid params', async () => {
    process.argv.push('--conf', '--fake=43243gfdsbfdg433g43', '--gist=gh_r422g4g2g')

    await inputService.read()

    expect(confActionSpy)
      .toHaveBeenCalledOnceWith({
        args: ['--fake=43243gfdsbfdg433g43', '--gist=gh_r422g4g2g'],
        data: { gist: 'gh_r422g4g2g' },
        modifiers: { gist: '--gist=gh_r422g4g2g' }
      })
  })

  it('should show help with no params', async () => {
    await inputService.read()

    expect(optionServiceSpy.help).toHaveBeenCalled()
  })

  it('should throw exception with invalid params', async () => {
    process.argv.push('--aaa')
    spyOn(inputService, 'read').and.callThrough()
    await expectAsync(inputService.read()).toBeRejectedWithError()
  })

  it('should send to command service', async () => {
    process.argv.push('test')

    await inputService.read()

    expect(commandServiceSpy.run).toHaveBeenCalled()
  })

  it('should read short options', async () => {
    process.argv.push('-c', '--token=43243gfdsbfdg433g43', '--gist=gh_r422g4g2g')

    await inputService.read()

    expect(confActionSpy)
      .toHaveBeenCalledOnceWith({
        args: ['--token=43243gfdsbfdg433g43', '--gist=gh_r422g4g2g'],
        data: { token: '43243gfdsbfdg433g43', gist: 'gh_r422g4g2g' },
        modifiers: { token: '--token=43243gfdsbfdg433g43', gist: '--gist=gh_r422g4g2g' }
      })
  })
})
