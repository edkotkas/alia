const { alias } = require('./store.js').config

module.exports = function(args) {
  let cmd = args.join(' ')
  for (const _ in args) {
    if (alias[cmd]) {
      return args.join(' ').replace(cmd, alias[cmd])
    }

    let t = cmd.split(' ')
    cmd = t.slice(0, t.length - 1).join(' ')
  }
}
