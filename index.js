#!/usr/bin/env node

const argv = process.argv.slice(2)

const { checkConfig } = require('./src/config')

checkConfig(() => {
  const cmd = require('./src/cmds')
  const opts = require('./src/opts')

  if (!opts(argv)){
    cmd(argv)
  }
})
