import Jasmine from 'jasmine'
import jasmineConfig from './jasmine.json' with { type: 'json' }

void (async function (): Promise<void> {
  process.env.NODE_ENV = 'test'

  const jasmine = new Jasmine({})

  jasmine.loadConfig(jasmineConfig)

  await jasmine.execute()
})()
