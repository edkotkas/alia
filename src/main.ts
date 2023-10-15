#!/usr/bin/env node
import logger from './logger.js'

import { CommandService } from './services/command.service.js'
import { ConfigService } from './services/config.service.js'
import { FlagService } from './services/flag.service.js'
import { GistService } from './services/gist.service.js'
import { InputService } from './services/input.service.js'

async function start(): Promise<void> {
  const configService = new ConfigService()
  const gistService = new GistService(configService)
  const flagService = new FlagService(configService, gistService)
  const commandService = new CommandService(configService)
  const inputService = new InputService(flagService, commandService)

  try {
    await inputService.read()
  } catch (e) {
    logger.error(e as Error)
  }
}

await start()
