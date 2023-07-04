import env from '../src/env'
import Log from '../src/logger'

describe('Logger', () => {

    beforeEach(() => {
        spyOn(console, 'info').and.callFake(() => ({}))
        spyOn(console, 'error').and.callFake(() => ({}))

        env.verbose = false
    })

    it('should call console info', () => {
        Log.info('test')

        expect(console.info).toHaveBeenCalledOnceWith('test')
    })

    it('should call console error', () => {
      const err = new Error('test')
      Log.error(err)

      expect(console.error).toHaveBeenCalledOnceWith('test')
    })

    it('should log error message with stack trace', () => {
      env.verbose = true
      const error = new Error('error')
      Log.error(error)

      expect(console.error).toHaveBeenCalledOnceWith(error)
    })

    it('should log error message w/o stack trace', () => {
      env.verbose = false

      const error = new Error('error')
      Log.error(error)
    
      expect(console.error).toHaveBeenCalledOnceWith('error')
    })
    
})
