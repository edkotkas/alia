#!/usr/bin/env node

const project = require('./package')

const cmd = require('./src/cmds')
const store = require('./src/store')

const { spawn } = require('child_process')

const separator = store.config.options.separator

const help = `
    Usage
    
      $ al [options] [alias] [${separator}] [command]
 
    Options
    
      --version, -v   show version
      --help, -h      show this
      
      --add, -a       add alias
      --remove, -r    remove alias
      --list, -l      list aliases (WIP)
 
    Examples
    
      $ al -a gp ${separator} git push
        > Added: gp ${separator} git push
        
      $ al gp
        > git push
        
      $ al -r gp
        > Removed: gp
`

const flags = ['--version', '-v', '--add', '-a', '--remove', '-r']

const argv = process.argv.slice(2)

if (!argv[0]) {
  console.log(help)
} else {
  if (flags.includes(argv[0])) {
    const args = argv.slice(1)

    if (argv[0] === '--version' || argv[0] === '-v') {
      console.log(project.version)

    } else if (argv[0] === '--help' || argv[0] === '-h') {
      console.log(help)

    } else if (argv[0] === '--add' || argv[0] === '-a') {
      store.alias.add(args)

    } else if (argv[0] === '--remove' || argv[0] === '-r') {
      store.alias.remove(args)

    }
  } else {
    let command = cmd(argv)

    if (!command) {
      console.error(`No alias found for: ${argv.join(' ')}`)
    } else {
      const [ps, ...opts] = command.split(' ')
      const process = spawn(ps, opts)

      process.stdout.on('data', data => {
        console.log(data.toString())
      })

      process.stderr.on('data', data => {
        console.error(data.toString())
      })
    }
  }
}

store.writeConfig()
