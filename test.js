const fs = require('fs')
const {spawn} = require('child_process')
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

  let child = spawn('node', ['./index.js', ...args]) //, {stdio: 'inherit'}
  child.stdout.on('data', data => result.data = data.toString())
  child.stderr.on('data', err => result.err = err.toString())
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
      config.should.excluding('aliaVersion').deep.equal(require('./src/defaultConfig.json'))

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

      config.alias.should.have.property('agree').with.deep.equal(['echo yes'])

      done()
    })
  })

  it('should use alias', done => {
    cli(['agree'], result => {
      if (result.err) {
        return done(result.err)
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

      config.alias.should.have.property('agree').with.deep.equal(['echo definitely'])

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
