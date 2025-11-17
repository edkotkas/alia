const registry = new Map()
const stack = new Map<string, string[]>()

// TODO: https://github.com/microsoft/TypeScript/issues/44939
export type Injectable<T, P extends unknown[]> = new (...args: P) => T

export function inject<T, P extends unknown[]>(token: Injectable<T, P>, ...args: P): T {
  const instance = registry.get(token) as T | undefined
  if (instance) {
    return instance
  }

  if (stack.has(token.name)) {
    const [main, ...rest] = Array.from(stack.keys())
    const chain = [...rest, token.name].join(' -> ')
    throw new Error(`Circular dependency in ${main}: ${chain}`)
  }

  stack.set(token.name, Array.from(stack.keys()))

  const newInstance = new token(...args)

  const result = provide(token, newInstance)

  return result
}

export function provide<T, P extends unknown[]>(token: Injectable<T, P>, instance: T): T {
  registry.set(token, instance)

  return instance
}

export function clearProviders(): void {
  registry.clear()
  stack.clear()
}
