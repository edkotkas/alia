import { info, error, set, init } from './logger.js'

describe('Logger', () => {
  beforeEach(() => {
    spyOn(console, 'info').and.callFake(() => ({}))
    spyOn(console, 'error').and.callFake(() => ({}))
  })

  it('should call console info', () => {
    info('test')
    expect(console.info).toHaveBeenCalledOnceWith('test')
  })

  it('should call console error', () => {
    const err = new Error('test')
    error(err)

    expect(console.error).toHaveBeenCalledOnceWith('test')
  })

  it('should call console log with set', () => {
    set('test', 'test')
    expect(console.info).toHaveBeenCalledOnceWith('test', 'set to:', 'test')
  })

  it('should call console log with init', () => {
    init()
    expect(console.info).toHaveBeenCalledTimes(2)
  })
})
