const fs = require('fs')
const { spawn } = require('child_process')
const chai = require('chai')
chai.use(require('chai-fs'))
chai.use(require('chai-exclude'))
chai.should()

const path = require('path')
const homedir = require('os').homedir()

process.env.NODE_ENV = 'test'

const aliaPath = path.join(homedir, '.alia_test.json')

function cli(args, cb) {
  let result = {
    err: [],
    data: []
  }
  let child = spawn('node', ['./index.js', ...args], { shell: true })
  child.stdout.setEncoding('utf8')
  child.stdout.on('data', data => result.data.push(data))
  child.stderr.setEncoding('utf8')
  child.stderr.on('data', data => result.err.push(data))
  child.on('close', () => cb(result))
}

describe('Alia', () => {

  it('should create global config', done => {
    cli([], result => {
      if (result.err.length > 0) {
        return done(result.err.join('\n'))
      }

      aliaPath.should.be.a.file()

      let config = JSON.parse(fs.readFileSync(aliaPath, 'utf8'))
      config.should
        .excluding('aliaVersion')
        .excluding('version')
        .deep.equal(require('./src/defaultConfig.json'))

      done()
    })
  })

  it(`should set alias`, done => {
    cli(['-s', 'agree', '@', 'echo yes'], result => {
      if (result.err.length > 0) {
        return done(result.err.join('\n'))
      }

      result.data[0].should.contain('Set alias: agree @ echo yes')

      let config = JSON.parse(fs.readFileSync(aliaPath, 'utf8'))

      config.alias
        .should.have.property('agree')
        .with.deep.equal({
        options: { shell: false },
        command: ['echo', 'yes']
      })

      done()
    })
  })

  it('should use alias', done => {
    cli(['agree'], result => {
      if (result.err.length > 0) {
        return done(result.err.join('\n'))
      }

      if (!result.data) {
        return done('no result returned')
      }

      result.data[0].should.contain('yes')
      done()
    })
  })

  it(`should update alias`, done => {
    cli(['-s', 'agree', '@', 'echo definitely'], result => {
      if (result.err.length > 0) {
        return done(result.err.join('\n'))
      }

      result.data[0].should.contain('Unset alias: agree @ echo yes')
      result.data[1].should.contain('Set alias: agree @ echo definitely')

      let config = JSON.parse(fs.readFileSync(aliaPath, 'utf8'))

      config.alias.should.have.property('agree').with.deep.equal({
        options: { shell: false },
        command: ['echo', 'definitely']
      })

      done()
    })
  })

  it('should remove alias', done => {
    cli(['-r', 'agree'], result => {
      if (result.err.length > 0) {
        return done(result.err.join('\n'))
      }

      result.data[0].should.contain('Removed alias: agree')

      let config = JSON.parse(fs.readFileSync(aliaPath, 'utf8'))

      config.alias.should.not.have.property('yell')

      done()
    })
  })

  it('should add command with shell option', done => {
    cli(['-s', '-x', 'shell', '@', '"echo best && echo test"'], result => {
      if (result.err.length > 0) {
        return done(result.err.join('\n'))
      }

      result.data[0].should.contain('Set alias: shell @ echo best && echo test')

      let config = JSON.parse(fs.readFileSync(aliaPath, 'utf8'))

      config.alias.should.have.property('shell')

      done()
    })
  })

  it('should run command with shell option', done => {
    cli(['shell'], result => {
      if (result.err.length > 0) {
        return done(result.err.join('\n'))
      }

      result.data[0].should.contain('best')
      result.data[1].should.contain('test')
      done()
    })
  })

  after(() => {
    fs.unlinkSync(aliaPath)
  })

})
