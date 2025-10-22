import { read } from './read.js'
import { Interface } from 'node:readline/promises'

describe('read', () => {
  it('should return a promise', () => {
    const rli: Interface = {
      question: jasmine.createSpy('question').and.returnValue(Promise.resolve(''))
    } as unknown as Interface

    const question = 'test?'
    const result = read.question(rli, question)

    expect(result).toBeInstanceOf(Promise)
  })
})
