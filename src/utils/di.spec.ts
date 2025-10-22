import { clearProviders, inject } from './di.js'

class SomeService {
  getValue() {
    return 'some value'
  }
}

class AnotherService {
  someService = inject(SomeService)

  getAnotherValue() {
    return this.someService.getValue() + ' another value'
  }
}

class YetAnotherService {
  anotherService = inject(AnotherService)
  someService = inject(SomeService)
}

class NextedService {
  yetAnotherService = inject(YetAnotherService)
}

class CircularService {
  circularService = inject(CircularService)
}

class CircularServiceA {
  circularServiceB = inject(CircularServiceB)
}

class CircularServiceB {
  circularServiceA = inject(CircularServiceA)
}

describe('Dependency Injection', () => {
  afterEach(() => {
    clearProviders()
  })

  it('should register and resolve services', () => {
    const service = inject(SomeService)

    expect(service).toBeInstanceOf(SomeService)
    expect(service.getValue()).toBe('some value')
  })

  it('should resolve dependencies', () => {
    const anotherService = inject(AnotherService)
    expect(anotherService).toBeInstanceOf(AnotherService)
    expect(anotherService.getAnotherValue()).toBe('some value another value')
  })

  it('should resolve multiple dependencies', () => {
    const yetAnotherService = inject(YetAnotherService)
    expect(yetAnotherService).toBeInstanceOf(YetAnotherService)
    expect(yetAnotherService.anotherService).toBeInstanceOf(AnotherService)
    expect(yetAnotherService.someService).toBeInstanceOf(SomeService)

    expect(yetAnotherService.anotherService.getAnotherValue()).toBe('some value another value')
    expect(yetAnotherService.someService.getValue()).toBe('some value')
  })

  it('should resolve nested dependencies', () => {
    const nextedService = inject(NextedService)
    expect(nextedService).toBeInstanceOf(NextedService)
    expect(nextedService.yetAnotherService).toBeInstanceOf(YetAnotherService)
    expect(nextedService.yetAnotherService.anotherService).toBeInstanceOf(AnotherService)
    expect(nextedService.yetAnotherService.someService).toBeInstanceOf(SomeService)
    expect(nextedService.yetAnotherService.anotherService.getAnotherValue()).toBe('some value another value')
    expect(nextedService.yetAnotherService.someService.getValue()).toBe('some value')
  })

  it('should throw on circular dependencies', () => {
    expect(() => inject(CircularService)).toThrowError(/Circular dependency/)
  })

  it('should throw on indirect circular dependencies', () => {
    expect(() => inject(CircularServiceA)).toThrowError(
      'Circular dependency in CircularServiceA: CircularServiceA -> CircularServiceB -> CircularServiceA'
    )
  })
})
