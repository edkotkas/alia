#!/usr/bin/env node

const argv = process.argv.slice(2)

const cmd = require('./commands')
const { options } = require('./options')

if (!options(argv)) {
  if (cmd(argv)) {
    console.error(`Failed to run command: ${argv.join(' ')}`)
  }
}


