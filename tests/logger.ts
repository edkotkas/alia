import Log from '../src/logger'

describe('Logger', () => {

    beforeEach(() => {
        spyOn(console, 'info').and.callFake(() => ({}))
        spyOn(console, 'error').and.callFake(() => ({}))
    })

    it('should call console info', () => {
        Log.info('test')

        expect(console.info).toHaveBeenCalledOnceWith('test')
    })

    it('should call console error', () => {
      const err = new Error('test')
      Log.error(err)

      expect(console.error).toHaveBeenCalledOnceWith(err)
    })

    it('should log error message with stack trace', () => {
      process.env.ALIA_DEBUG = 'true'
      const error = new Error('error')
      Log.error(error)

      expect(console.error).toHaveBeenCalledOnceWith(error)
    })

    it('should log error message w/o stack trace', () => {
      process.env.ALIA_DEBUG = 'false'

      const error = new Error('error')
      Log.error(error)
    
      expect(console.error).toHaveBeenCalledOnceWith('error')
    })
    
})
