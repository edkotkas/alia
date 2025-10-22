import { clearProviders, inject, provide } from '../utils/di.js'
import logger from '../utils/logger.js'
import { CommandService } from './command.service.js'
import { FlagService } from './flag.service.js'
import { InputService } from './input.service.js'

describe('InputService', () => {
  let inputService: InputService
  let flagServiceSpy: jasmine.SpyObj<FlagService>
  let commandServiceSpy: jasmine.SpyObj<CommandService>
  let errorSpy: jasmine.Spy

  beforeEach(() => {
    errorSpy = spyOn(logger, 'error').and.callFake(() => ({}))
    flagServiceSpy = jasmine.createSpyObj<FlagService>('FlagService', ['run'])
    commandServiceSpy = jasmine.createSpyObj<CommandService>('CommandService', ['run'])

    provide(FlagService, flagServiceSpy)
    provide(CommandService, commandServiceSpy)

    inputService = inject(InputService)
  })

  afterEach(() => {
    clearProviders()
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

  it('should log error', async () => {
    const error = new Error('test error')
    flagServiceSpy.run.and.rejectWith(error)
    await inputService.read()

    expect(errorSpy).toHaveBeenCalledOnceWith(error)
  })
})
