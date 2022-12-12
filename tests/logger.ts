import { Log } from '../src/logger'

describe('Logger', () => {

    beforeEach(() => {
        spyOn(console, 'log').and.callFake(() => ({}))
        spyOn(console, 'error').and.callFake(() => ({}))
    })

    it('should call console log', () => {
        Log.info('test')

        expect(console.log).toHaveBeenCalledOnceWith('test')
    })

    it('should call console error', () => {
        Log.error('test')

        expect(console.error).toHaveBeenCalledOnceWith('test')
    })
})
