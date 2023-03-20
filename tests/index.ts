import Jasmine from 'jasmine'

void async function(): Promise<void> {
  const jasmine = new Jasmine({})

  jasmine.loadConfig({
    spec_dir: 'tests',
    spec_files: [
      '**/*.ts'
    ],
    stopSpecOnExpectationFailure: false,
    random: false
  })

  await jasmine.execute()
}()
