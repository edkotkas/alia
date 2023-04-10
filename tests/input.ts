import type { CommandService, ConfigService, OptionService } from '../src/services'
import { InputService } from '../src/services'

describe('InputService', () => {

  let inputService: InputService
  let optionServiceSpy: jasmine.SpyObj<OptionService>
  let commandServiceSpy: jasmine.SpyObj<CommandService>
  let configServiceSpy: jasmine.SpyObj<ConfigService>

  let confActionSpy: jasmine.Spy
  let envActionSpy: jasmine.Spy
  let versionActionSpy: jasmine.Spy
  
  beforeEach(() => {
    process.argv = ['', '']

    confActionSpy = jasmine.createSpy('confAction')
    envActionSpy = jasmine.createSpy('envActionSpy')
    versionActionSpy = jasmine.createSpy('versionActionSpy')

    optionServiceSpy = jasmine.createSpyObj<OptionService>('OptionService', ['help'], {
      flags: [
        {
          key: 'conf', short: 'c', modifiers: [
            { key: 'token' }, { key: 'gist' }
          ], action: confActionSpy
        },
        {
          key: 'set', short: 's', modifiers: [
            {
              key: 'env',
              format: /\w+=\w+/
            }
          ], action: envActionSpy
        },
        {
          key: 'version',
          short: 'v',
          action: versionActionSpy
        }
      ]
    })

    configServiceSpy = jasmine.createSpyObj('ConfigService', ['getSeparator'])

    configServiceSpy.getSeparator.and.returnValue('--')

    commandServiceSpy = jasmine.createSpyObj<CommandService>('CommandService', ['run'])
    commandServiceSpy.run.and.callFake(() => undefined)

    inputService = new InputService(optionServiceSpy, commandServiceSpy, configServiceSpy)
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
    const spy = optionServiceSpy.help.and.callThrough()
    await inputService.read()


    expect(spy).toHaveBeenCalled()
  })

  it('should throw exception with invalid params', async () => {
    process.argv.push('--aaa')
    spyOn(inputService, 'read').and.callThrough()
    await expectAsync(inputService.read()).toBeRejectedWithError()
  })

  it('should send to command service', async () => {
    const spy = commandServiceSpy.run.and.callThrough()
    process.argv.push('test')

    await inputService.read()

    expect(spy).toHaveBeenCalled()
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

  it('should read env modifier', async () => {
    process.argv.push('-s', '--env', 'test=123', 'abc=321', 'env', '--', 'echo', '%test%', '%abc%')

    await inputService.read()

    expect(envActionSpy)
      .toHaveBeenCalledOnceWith({
        args: ['--env', 'test=123', 'abc=321', 'env', '--', 'echo', '%test%', '%abc%'],
        data: { env: ['test=123', 'abc=321'] },
        modifiers: { env: '--env' }
      })
  })

  it('should read env modifier only for alia and not command', async () => {
    process.argv.push('-s', '--env', 'test=123', 'abc=321', 'env', '--', 'echo', 'stuff=test', '%abc%')

    await inputService.read()

    expect(envActionSpy)
      .toHaveBeenCalledOnceWith({
        args: ['--env', 'test=123', 'abc=321', 'env', '--', 'echo', 'stuff=test', '%abc%'],
        data: { env: ['test=123', 'abc=321'] },
        modifiers: { env: '--env' }
      })
  })

  it('should pass with no modifiers', async () => {
    process.argv.push('-v')

    await inputService.read()

    expect(versionActionSpy)
      .toHaveBeenCalledOnceWith({
        args: [],
        data: {},
        modifiers: {}
      })
  })

  it('should pass return empty data when no modifier data matches', async () => {
    process.argv.push('-c', '--token')

    await inputService.read()

    expect(confActionSpy)
      .toHaveBeenCalledOnceWith({
        args: ['--token'],
        data: { },
        modifiers: { token: '--token' }
      })
  })

  it('should set debug env variable', async () => {
    process.argv.push('-v', '--debug')

    await inputService.read()

    expect(process.env.ALIA_DEBUG).toEqual('true')
  })
})
