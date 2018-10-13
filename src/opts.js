const project = require('../package')
const config = require('./config')

const help = `
  Usage
  
    $ al [options] [alias] [--] [command]
  
  Options
  
    --version, -v   show version
    --help, -h      show this
  
    --add, -a       add alias
    --remove, -r    remove alias
    --list, -l      list aliases (WIP)
    --generate, -g  generate alia file in current dir (WIP)
  
  Examples
  
    $ al -a gp -- git push
      > Added: gp -- git push
  
    $ al gp
      > git push
  
    $ al -r gp
      > Removed: gp
`


const options = [
  [
    '--version, -v', () => console.log(project.version)
  ],
  [
    '--help, -h', () => console.log(help)
  ],
  [
    '--add, -a', argv => config.add(argv, (err, cmd) => {
    if (err) {
      return console.error(err)
    }

    console.log(`Added: ${cmd}`)
  })
  ],
  [
    '--remove, -r', argv => config.remove(argv, (err, cmd) => {
    if (err) {
      return console.error(err)
    }

    console.log(`Removed: ${cmd}`)
  })
  ],
  [
    '--generate, -g', () => console.log('Under Construction')
  ],
  [
    '--list, -l', () => console.log('Under Construction')
  ],
]

module.exports = function(argv) {
  console.log(argv)
  if (!argv[0]) {
    console.log(help)
    return true
  }

  if (!argv[0].startsWith('-')) {
    return false
  }

  let [option, action] = options.find(([key, _]) => {
    console.log(key)
    return key.split(', ').includes(argv[0])
  })
  if (option) {
    action(argv.slice(1))
    return true
  }

  return false
}