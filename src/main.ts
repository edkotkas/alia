#!/usr/bin/env node
import { InputService } from './services/input.service.js'
import { inject } from './utils/di.js'

const inputService = inject(InputService)

await inputService.read()
