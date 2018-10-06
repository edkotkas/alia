const alia = require('../alia')

module.exports = function(args) {
  let cmd = args.join(' ')
  for (const _ in args) {
    if (alia[cmd]) {
      return args.join(' ').replace(cmd, alia[cmd])
    }

    let t = cmd.split(' ')
    cmd = t.slice(0, t.length - 1).join(' ')
  }
}