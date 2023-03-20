export function info(...data: unknown[]): void {
  console.info(...data)
}

export function error(...data: unknown[]): void {
  console.error(...data)
}


export default { info, error }
