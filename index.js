#!/usr/bin/env node

const argv = process.argv.slice(2)

const cmd = require('./src/commands')
const opts = require('./src/options')

if (opts(argv)){
  if (cmd(argv)) {
    console.error(`Failed to run command: ${argv}`)
  }
}
