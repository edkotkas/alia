import child from 'node:child_process'
import type { SpawnSyncReturns } from 'node:child_process';
import type { Command } from './models'
import type { ConfigService } from '../src/services';
import { CommandService } from '../src/services'

describe('CommandService', () => {

  let commandService: CommandService
  let configService: jasmine.SpyObj<ConfigService>

  beforeEach(() => {
    configService = jasmine.createSpyObj<ConfigService>('ConfigService', ['getAlias'])
    commandService = new CommandService(configService)
  })

  it ('should throw exception with invalid params', () => {
    expect(() => commandService.run([])).toThrowError()
  })

  it ('should throw exception with no alias', () => {
    configService.getAlias.and.returnValue(undefined)
    expect(() => commandService.run(['test'])).toThrowError()
  })

  it ('should spawn command', () => {
    configService.getAlias.and.returnValue({
      command: [''],
      options: {
        shell: false
      }
    })

    spyOn(child, 'spawnSync').and.returnValue({} as SpawnSyncReturns<Buffer>)

    commandService.run(['test'])

    expect(child.spawnSync).toHaveBeenCalled()
  })
})
