export function info(...data: unknown[]): void {
  console.info(...data)
}

export function error(...data: Error[]): void {
  console.error(...data.map((d) => d.message))
}

export function set(key: string, value: string | number | boolean): void {
  info(key, 'set to:', value)
}

export default { info, error, set }
