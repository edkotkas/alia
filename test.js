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
  let result = {}
  let child = spawn('node', ['./index.js', ...args], { shell: true })
  child.stdout.setEncoding('utf8')
  child.stdout.on('data', data => result.data = data)
  child.stderr.setEncoding('utf8')
  child.stderr.on('data', data => result.err = data)
  child.on('close', () => cb(result))
}

describe('Alia', () => {

  it('should create global config', done => {
    cli([], result => {
      if (result.err) {
        return done(result.err)
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
      if (result.err) {
        return done(result.err)
      }

      result.data.should.contain('Set alias: agree @ echo yes')

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
      if (result.err || !result.data) {
        return done(result.err || 'no result returned')
      }

      result.data.should.contain('yes')
      done()
    })
  })

  it(`should update alias`, done => {
    cli(['-s', 'agree', '@', 'echo definitely'], result => {
      if (result.err) {
        return done(result.err)
      }

      result.data.should.contain('Set alias: agree @ echo definitely')

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
      if (result.err) {
        return done(result.err)
      }

      result.data.should.contain('Removed alias: agree')

      let config = JSON.parse(fs.readFileSync(aliaPath, 'utf8'))

      config.alias.should.not.have.property('yell')

      done()
    })
  })

  after(() => {
    fs.unlinkSync(aliaPath)
  })

})
