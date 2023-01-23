import { Log } from '../src/logger'

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
        Log.error('test')

        expect(console.error).toHaveBeenCalledOnceWith('test')
    })
})
