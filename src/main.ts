#!/usr/bin/env node
import Log from './logger.js'
import { CommandService, ConfigService, GistService, InputService, OptionService } from './services/index.js'

async function start(): Promise<void> {
  process.removeAllListeners('warning')

  const configService = new ConfigService()
  const gistService = new GistService(configService)
  const optionService = new OptionService(configService, gistService)
  const commandService = new CommandService(configService)
  const inputService = new InputService(optionService, commandService, configService)

  try {
    await inputService.read()
  } catch (e) {
    Log.error(e as Error)
  }
}

await start()
