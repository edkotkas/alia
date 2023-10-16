import Jasmine from 'jasmine'

void (async function (): Promise<void> {
  process.env.NODE_ENV = 'test'

  const jasmine = new Jasmine({})

  jasmine.loadConfig({
    spec_dir: 'src',
    spec_files: ['**/*.spec.ts'],
    stopSpecOnExpectationFailure: false,
    random: false
  })

  await jasmine.execute()
})()
