const registry = new Map<Injectable<unknown>, unknown>()

export type Injectable<T> = new () => T
const stack = new Set<Injectable<unknown>>()

export function inject<T>(token: Injectable<T>): T {
  const instance = registry.get(token) as T | undefined
  if (instance) {
    return instance
  }

  if (stack.has(token)) {
    const chain = [...stack].map((t) => t.name).join(' -> ')

    stack.clear()

    throw new Error(`Circular dependency in ${token.name}: ${chain} -> ${token.name}`)
  }

  stack.add(token)

  const newInstance = new token()

  stack.delete(token)

  return provide(token, newInstance)
}

export function provide<T>(token: Injectable<T>, instance: T): T {
  registry.set(token, instance)

  return instance
}

export function clearProviders(): void {
  registry.clear()
  stack.clear()
}
