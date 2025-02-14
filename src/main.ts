#!/usr/bin/env node
import { CommandService } from './services/command.service.js'
import { ConfigService } from './services/config.service.js'
import { FlagLoaderService } from './services/flag-loader.service.js'
import { FlagService } from './services/flag.service.js'
import { GistService } from './services/gist.service.js'
import { InputService } from './services/input.service.js'

const configService = new ConfigService()
const flagLoaderService = new FlagLoaderService()
const gistService = new GistService(configService)
const flagService = new FlagService(configService, gistService, flagLoaderService)
const commandService = new CommandService(configService)
const inputService = new InputService(flagService, commandService)

await inputService.read()
