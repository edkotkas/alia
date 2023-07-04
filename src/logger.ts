import env from './env.js'

export function info(...data: unknown[]): void {
  console.info(...data)
}

export function error(...data: Error[]): void {
  if (env.verbose) {
    return console.error(...data)
  }

  console.error(...data.map((d) => d.message))
  info('Run with `--verbose` for stacktrace')
}


export default { info, error }
