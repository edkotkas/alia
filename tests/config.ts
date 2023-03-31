import path from 'node:path'
import nfs from 'node:fs'
import type { Config } from '../src/models'
import type { Interface } from 'node:readline/promises'
import Log from '../src/logger'
import { ConfigService } from '../src/services/config.service'

describe('ConfigService', () => {

  const fs = {
    read: jasmine.createSpy(),
    write: jasmine.createSpy(),
    exists: jasmine.createSpy()
  }

  const rl = {
    question: jasmine.createSpy()
  }

  let configService: ConfigService

  let testConfig: Config = {
    version: 1,
    meta: {
      gist: {
        token: "test",
        id: "test"
      }
    },
    options: {
      separator: "@",
      shell: false
    },
    alias: {
    }
  }

  let infoSpy: jasmine.Spy

  beforeEach(() => {
    configService = new ConfigService()
    configService.fs = fs
    configService.rl = rl

    fs.read.and.returnValue(JSON.stringify(testConfig))
    fs.write.and.callFake((_, data: Config) => {
      testConfig = data
    })

    infoSpy = spyOn(Log, 'info').and.callFake(() => ({}))
  })

  describe('Wrappers', () => {
    let cs: ConfigService
    const tempPath = path.join('.alia_test.json')
    
    beforeAll(() => {
      cs = new ConfigService()
    })

    it('should write to path', () => {
      cs.fs.write(tempPath, {} as Config)
      expect(nfs.existsSync(tempPath)).toEqual(true)
    })

    it('should read from path', () => {
      expect(cs.fs.read(tempPath)).toEqual('{}')
    })

    it('should check if file exists in path', () => {
      expect(cs.fs.exists(tempPath)).toEqual(true)
    })

    it('should prompt for answer from cli', async () => {
      const rli = jasmine.createSpyObj<Interface>('Interface', ['question'])
      const spy = rli.question.and.resolveTo()
      
      await cs.rl.question(rli, 'Test')

      expect(spy).toHaveBeenCalled()
    })

    afterAll(() => {
      nfs.unlinkSync(tempPath)
    })
  })

  it('should fail to load config', () => {
    fs.read.and.returnValue(undefined)
    expect(() => configService.config).toThrowError()
  })

  it('should initialise new config', async () => {
    fs.exists.and.returnValue(false)
    await configService.init()
    expect(infoSpy).toHaveBeenCalledOnceWith('Created config:', configService.filePath)
  })

  it('should not overwrite existing config', async () => {
    fs.exists.and.returnValue(true)
    rl.question.and.resolveTo('y')

    await configService.init()

    expect(infoSpy).toHaveBeenCalled()
  })

  it('should overwrite existing config', async () => {
    fs.exists.and.returnValue(true)
    rl.question.and.resolveTo('n')
    
    await configService.init()

    expect(infoSpy).not.toHaveBeenCalled()
  })

  it('should get alias', () => {
    const al = configService.getAlias('test')
    expect(al).toEqual(configService.defaultConfig.alias.test)
  })

  it('should set alias', () => {
    const expectedCommand = {
      command: ['echo', 'set-test'],
      options: {
        shell: false
      }
    }

    configService.setAlias('set', expectedCommand)
    expect(configService.config.alias.set).toEqual(expectedCommand)
  })

  it('should remove alias', () => {
    expect(configService.config.alias.test).toBeDefined()
    configService.removeAlias('test')
    expect(configService.config.alias.test).toBeUndefined()
  })

  it('should get separator', () => {
    expect(configService.getSeparator()).toEqual('@')
  })

  it('should set separator', () => {
    configService.setSeparator('--')
    expect(configService.config.options.separator).toEqual('--')
  })

  it('should set separator to default', () => {
    configService.setSeparator('--')
    expect(configService.config.options.separator).toEqual('--')
    configService.setSeparator(undefined)
    expect(configService.config.options.separator).toEqual('@')
  })

  it('should get token', () => {
    expect(configService.getToken()).toEqual('')
  })

  it('should set token', () => {
    configService.setToken('test')
    expect(configService.config.meta.gist.token).toEqual('test')
  })

  it('should get gist id', () => {
    expect(configService.getGistId()).toEqual('')
  })

  it('should set gist id', () => {
    configService.setGistId('test')
    expect(configService.config.meta.gist.id).toEqual('test')
  })

  it('should get meta data', () => {
    expect(configService.getMetaData()).toEqual(testConfig.meta)
  })

  it('should save global config', () => {
    configService.save(testConfig)
    expect(fs.write).toHaveBeenCalled()
  })

  it('should save local config', () => {
    const expectedConfig = {
      alias: {},
      meta: {
        gist: {
          id: 'test',
          token: 'test'
        }
      },
      options: {
        separator: 'test',
        shell: false
      },
      version: 12
    }

    configService.save(expectedConfig)

    expect(fs.write).toHaveBeenCalled()
  })

  it('should get shell option', () => {
    const shell = configService.getShell()
    expect(shell).toBeFalse()
  })

  it('should set shell option', () => {
    expect(configService.config.options.shell).toBeFalse()
    configService.setShell(true)

    expect(configService.getShell()).toBeTrue()
  })
})
