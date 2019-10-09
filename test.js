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

  it(`should add alias`, done => {
    cli(['-a', 'yell', '@', 'echo'], result => {
      if (result.err) {
        return done(result.err)
      }

      result.data.should.contain('Set alias: yell @ echo')

      let config = JSON.parse(fs.readFileSync(aliaPath, 'utf8'))

      config.alias.should.have.property('yell').with.deep.equal(['echo'])

      done()
    })
  })

  it('should use alias', done => {
    cli(['yell', '"testing"'], result => {
      if (result.err) {
        return done(result.err)
      }

      result.data.should.contain('"testing"')
      done()
    })
  })

  it(`should set alias`, done => {
    cli(['-s', 'agree', '@', 'yes'], result => {
      if (result.err) {
        return done(result.err)
      }

      result.data.should.contain('Set alias: agree @ yes')

      let config = JSON.parse(fs.readFileSync(aliaPath, 'utf8'))

      config.alias.should.have.property('agree').with.deep.equal(['yes'])

      done()
    })
  })

  it(`should update alias`, done => {
    cli(['-s', 'agree', '@', 'echo', 'definitely'], result => {
      if (result.err) {
        return done(result.err)
      }

      result.data.should.contain('Set alias: agree @ echo definitely')

      let config = JSON.parse(fs.readFileSync(aliaPath, 'utf8'))

      config.alias.should.have.property('agree').with.deep.equal(['echo', 'definitely'])

      done()
    })
  })

  it(`should set experimental alias`, done => {
    cli(['-s', '-x', 'wow', '@', 'echo test && echo nice'], result => {
      if (result.err) {
        return done(result.err)
      }

      result.data.should.contain('Set alias: wow @ EXPERIMENTAL echo test && echo nice')

      let config = JSON.parse(fs.readFileSync(aliaPath, 'utf8'))

      config.alias.should.have.property('wow').with.deep.equal(['EXPERIMENTAL', 'echo test && echo nice'])

      done()
    })
  })

  it('should remove alias', done => {
    cli(['-r', 'yell'], result => {
      if (result.err) {
        return done(result.err)
      }

      result.data.should.contain('Removed alias: yell')


      let config = JSON.parse(fs.readFileSync(aliaPath, 'utf8'))

      config.alias.should.not.have.property('yell')

      done()
    })
  })

  after(() => {
    fs.unlinkSync(aliaPath)
  })

})
