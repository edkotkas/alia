import { toBool } from './to-bool.js'

describe('ToBool', () => {
  it('should return true - empty', () => {
    expect(toBool([])).toBe(true)
  })

  it('should return true', () => {
    expect(toBool(['true'])).toBe(true)
  })

  it('should return true - 1', () => {
    expect(toBool(['1'])).toBe(true)
  })

  it('should return true - on', () => {
    expect(toBool(['on'])).toBe(true)
  })

  it('should return true - yes', () => {
    expect(toBool(['yes'])).toBe(true)
  })

  it('should return true - y', () => {
    expect(toBool(['y'])).toBe(true)
  })

  it('should return false', () => {
    expect(toBool(['false'])).toBe(false)
  })

  it('should return false - 0', () => {
    expect(toBool(['0'])).toBe(false)
  })

  it('should return false - off', () => {
    expect(toBool(['off'])).toBe(false)
  })

  it('should return false - no', () => {
    expect(toBool(['no'])).toBe(false)
  })

  it('should return false - n', () => {
    expect(toBool(['n'])).toBe(false)
  })

  it('should return undefined', () => {
    expect(toBool(['invalid'])).toBe(undefined)
  })

  it('should return undefined - invalid true start', () => {
    expect(toBool(['ntrue'])).toBe(undefined)
  })

  it('should return undefined - invalid false start', () => {
    expect(toBool(['yfalse'])).toBe(undefined)
  })

  it('should return undefined - invalid true end', () => {
    expect(toBool(['truey'])).toBe(undefined)
  })

  it('should return undefined - invalid false end', () => {
    expect(toBool(['falsey'])).toBe(undefined)
  })
})
