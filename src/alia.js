const project = require('../package')
const {config, projectConfig, write} = require('./config')

function version() {
  console.log(project.version)
}

function help() {
  const separator = config.options.separator
  console.log(`
      Usage
      
        $ al [options] [alias] [${separator}] [command]
   
      Options
      
        --version, -v     show version
        --help, -h        show this
        
        --add, -a         add alias (add -p for project alias)
        --remove, -r      remove alias (add -p for project alias)
        --project, -p     create project alia config
        --list, -l        list available alias
        
        --conf, -c        change alia configuration
          separator [string]                set alias separator (default: @)   
          token <your github api token>     set the api token for gist sync
          gist <your gist id>               set the gist id to use for sync
          
        --sync, -s        backup/restore your config (default: restore)
          push    backup your current config
          pull    restore config from gist

      Examples
      
        $ al -a gp ${separator} git push
          > Added: gp ${separator} git push
          
        $ al gp
          > git push
          
        $ al -r gp
          > Removed: gp
  `)
}


function add(args) {
  const project = args[0] === '-p'
  let separatorIndex = args.indexOf(config.options.separator)
  if (separatorIndex === -1) {
    console.error(`Invalid Input, missing separator: '${config.options.separator}'`)
    return 1
  }

  const key = args.slice(project ? 1 : 0, separatorIndex).join(' ')
  const cmd = args.slice(separatorIndex + config.options.separator.length - 1)

  if (project) {
    if (projectConfig.alias[key]) {
      console.error(`Alias '${key}' already exists - remove and try again`)
      return 1
    } else {
      projectConfig.alias[key] = cmd
      write(true)
    }
  } else {
    if (config.alias[key]) {
      console.error(`Alias '${key}' already exists - remove and try again`)
      return 1
    } else {
      config.alias[key] = cmd
      write()
    }
  }


  console.log(`Added alias: ${key} ${config.options.separator} ${cmd.join(' ')}`)
  return 0
}

function remove(args) {
  const project = args[0] === '-p'
  const key = project ? args.slice(1) : args.join(' ').trim()

  if (!key) {
    console.error('No alias specified')
    return 1
  }
  if (project) {
    if (!projectConfig.alias[key]) {
      console.error(`Alias '${key}' does not exist`)
      return 1
    } else {
      delete projectConfig.alias[key]
      write(true)
    }
  } else {
    if (!config.alias[key]) {
      console.error(`Alias '${key}' does not exist`)
      return 1
    } else {
      delete config.alias[key]
      write()
    }
  }

  console.log(`Removed alias: ${key}`)
  return 0
}

function mapList(alias) {
  return Object.keys(alias).map(key => `${key} \t${config.options.separator} \t${alias[key].join(' ')}`)
}

function list() {
  let alias = ['Global', ...mapList(config.alias)]

  if (projectConfig && Object.keys(projectConfig.alias).length > 0) {
    const projectAlias = mapList(projectConfig.alias)
    alias.push('\nProject', ...projectAlias)
  }

  console.log(alias.join('\n'))
}

module.exports = {add, remove, list, help, version}