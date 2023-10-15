import type { CommandService } from './command.service'
import type { FlagService } from './flag.service'
import { InputService } from './input.service'

describe('InputService', () => {
  let inputService: InputService
  let flagServiceSpy: jasmine.SpyObj<FlagService>
  let commandServiceSpy: jasmine.SpyObj<CommandService>

  beforeEach(() => {
    flagServiceSpy = jasmine.createSpyObj<FlagService>('FlagService', ['run'])
    commandServiceSpy = jasmine.createSpyObj<CommandService>('CommandService', ['run'])

    inputService = new InputService(flagServiceSpy, commandServiceSpy)
  })

  it('should be defined', () => {
    expect(inputService).toBeDefined()
  })

  it('should call flagService', async () => {
    const flagSpy = flagServiceSpy.run.and.resolveTo(true)
    const commandSpy = commandServiceSpy.run.and.resolveTo()

    await inputService.read()

    expect(flagSpy).toHaveBeenCalledOnceWith([])
    expect(commandSpy).not.toHaveBeenCalled()
  })

  it('should call commandService', async () => {
    const flagSpy = flagServiceSpy.run.and.resolveTo(false)
    const commandSpy = commandServiceSpy.run.and.resolveTo()

    await inputService.read()

    expect(flagSpy).toHaveBeenCalledOnceWith([])
    expect(commandSpy).toHaveBeenCalledOnceWith([])
  })
})
