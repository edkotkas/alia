import fs from 'node:fs'
import type { Config } from '../models/config.model'
import { file } from './file'

describe('file', () => {
  beforeAll(() => {
    if (!fs.existsSync('tmp')) {
      fs.mkdirSync('test-tmp')
    }
  })

  beforeEach(() => {
    unlinkTempFile()
  })

  afterAll(() => {
    unlinkTempFile()
    fs.rmdirSync('test-tmp')
  })

  it('should write and read a file', () => {
    const path = 'test-tmp/test.json'
    const data = { name: 'test' } as unknown as Config

    file.write(path, data)
    const result = file.read(path)

    expect(result).toEqual(JSON.stringify(data, null, 2))
  })

  it('should check if a file exists', () => {
    const path = 'test-tmp/test.json'
    const data = { name: 'test' } as unknown as Config

    file.write(path, data)
    const result = file.exists(path)

    expect(result).toBe(true)
  })
})

function unlinkTempFile() {
  const path = 'test-tmp/test.json'
  if (fs.existsSync(path)) {
    fs.unlinkSync(path)
  }
}
