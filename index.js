#!/usr/bin/env node

const project = require('./package')

const cmd = require('./src/cmds')
const store = require('./src/store')

const { exec } = require('child_process')

const help = `
    Usage
    
      $ al [options] [alias] [~] [command]
 
    Options
    
      --version, -v   show version
      --help, -h      show this
      
      --add, -a       add alias
      --remove, -r    remove alias
      --list, -l      list aliases (WIP)
      --generate, -g  generate alia file in current dir (WIP)
 
    Examples
    
      $ al -a gp ~ git push
        > Added: gp ~ git push
        
      $ al gp
        > git push
        
      $ al -r gp
        > Removed: gp
`

const flags = ['--version', '-v', '--add', '-a', '--remove', '-r', '--generate', '-g']

const argv = process.argv.slice(2)


if (!argv[0]) {
  console.log(help)
} else {
  if (flags.includes(argv[0])) {
    if (argv[0] === '--version' || argv[0] === '-v') {
      console.log(project.version)
    } else if (argv[0] === '--help' || argv[0] === '-h') {
      console.log(help)
    } else if (argv[0] === '--generate' || argv[0] === '-g') {
      console.log('Fake generating to:', process.cwd())
    }  else if (argv[0] === '--add' || argv[0] === '-a') {
      store.add(argv.slice(1), (err, cmd) => {
        if (err) {
          return console.error(err)
        }

        console.log(`Added: ${cmd}`)
      })
    } else if (argv[0] === '--remove' || argv[0] === '-r') {
      store.remove(argv.slice(1), (err, cmd) => {
        if (err) {
          return console.error(err)
        }

        console.log(`Removed: ${cmd}`)
      })
    }
  } else {
    let command = cmd(argv)

    if (!command) {
      console.error(`
        No alias found for: ${argv.join(' ')}
      `)
    } else {
      exec(command, (err, stdout, stderr) => {
        if (stdout) {
          console.log(stdout)
        }

        if (stderr) {
          console.error(stderr)
        }
      })
    }
  }
}
