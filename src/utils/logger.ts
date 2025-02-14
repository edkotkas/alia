export function info(...data: unknown[]): void {
  console.info(...data)
}

export function error(...data: Error[]): void {
  console.error(...data.map((d) => d.message))
}

export function set(key: string, value: string | number | boolean): void {
  info(key, 'set to:', value)
}

export function init(): void {
  info('failed to load config')
  info('make sure to run: al --init')
}

export default { info, error, set, init }
