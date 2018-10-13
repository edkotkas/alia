#!/usr/bin/env node

const setup = require('./src/setup')

const argv = process.argv.slice(2)

setup.run(() => {
  const cmd = require('./src/cmds')
  const opts = require('./src/opts')

  if (!opts(argv)){
    cmd(argv)
  }
})


