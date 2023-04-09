export function info(...data: unknown[]): void {
  console.info(...data)
}

export function error(...data: Error[]): void {
  if (process.env.ALIA_DEBUG === 'true') {
    return console.error(...data)
  }

  console.error(...data.map((d) => d.message))
}


export default { info, error }
