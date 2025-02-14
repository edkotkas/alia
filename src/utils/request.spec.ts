import https from 'node:https'
import { request } from './request'
import type { ClientRequest, IncomingMessage } from 'http'

function createHttpsRequestSpy(responseOptions: { statusCode: number; data: string; error?: Error }) {
  const encodeSpy = jasmine.createSpy('setEncoding')
  const onSpy = jasmine.createSpy('on')
  const writeSpy = jasmine.createSpy('write')
  const endSpy = jasmine.createSpy('end')

  const requestSpy = spyOn(https, 'request').and.callFake(
    (
      url: string | URL | https.RequestOptions,
      options?: https.RequestOptions | ((res: IncomingMessage) => void),
      callback?: (res: IncomingMessage) => void
    ) => {
      const res = {
        statusCode: responseOptions.statusCode,
        statusMessage: responseOptions.error ? responseOptions.error.message : 'OK',
        setEncoding: encodeSpy,
        on: (event: string, listener: (data?: string) => void) => {
          if (event === 'data' && !responseOptions.error) {
            listener(responseOptions.data)
          }
          if (event === 'end') {
            listener()
          }
        }
      }

      if (callback) {
        callback(res as unknown as IncomingMessage)
      }

      return {
        on: onSpy.and.callFake((event: string, listener: (data?: Error) => void) => {
          if (event === 'error' && responseOptions.error) {
            listener(responseOptions.error)
          }
        }),
        write: writeSpy,
        end: endSpy
      } as unknown as ClientRequest
    }
  )

  return {
    requestSpy,
    encodeSpy,
    onSpy,
    writeSpy,
    endSpy
  }
}

describe('request', () => {
  it('should resolve with data on successful request', async () => {
    const { writeSpy, encodeSpy } = createHttpsRequestSpy({
      statusCode: 200,
      data: JSON.stringify({ updated_at: 'mocked data', html_url: '', files: {} })
    })

    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'request'
      }
    }

    const result = await request.call('example.com', options)
    expect(result).toEqual({ updated_at: 'mocked data', html_url: '', files: {} })
    expect(writeSpy).not.toHaveBeenCalled()
    expect(encodeSpy).toHaveBeenCalledOnceWith('utf8')
  })

  it('should reject with error on network error', async () => {
    const { requestSpy } = createHttpsRequestSpy({ statusCode: 500, data: '', error: new Error('Network Error') })

    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'request'
      }
    }

    await expectAsync(request.call('test-id', options)).toBeRejectedWithError('Network Error')
    expect(requestSpy).toHaveBeenCalledOnceWith('https://api.github.com/gists/test-id', options, jasmine.any(Function))
  })

  it('should reject with error on invalid JSON', async () => {
    createHttpsRequestSpy({ statusCode: 200, data: 'invalid json' })

    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'request'
      }
    }

    await expectAsync(request.call('test-id', options)).toBeRejectedWith(jasmine.any(SyntaxError))
  })

  it('should post data', async () => {
    const { requestSpy, writeSpy, endSpy } = createHttpsRequestSpy({
      statusCode: 200,
      data: JSON.stringify({ updated_at: 'mocked data', html_url: '', files: {} })
    })

    const options = {
      method: 'POST',
      headers: {
        'User-Agent': 'request'
      }
    }

    await request.call('example.com', options, 'test-data')

    expect(requestSpy).toHaveBeenCalledOnceWith(
      'https://api.github.com/gists/example.com',
      options,
      jasmine.any(Function)
    )
    expect(writeSpy).toHaveBeenCalledOnceWith('test-data')
    expect(endSpy).toHaveBeenCalledOnceWith()
  })
})
