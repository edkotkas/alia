# Alia 
[![Build Status](https://travis-ci.org/edkotkas/alia.svg?branch=master)](https://travis-ci.org/edkotkas/alia)
[![install size](https://packagephobia.com/badge?p=alia@0.10.0)](https://packagephobia.com/result?p=alia@0.10.0)

> Alias To Go

Works on Linux, Windows and maybe macOS (not tried).

## Install

```bash
$ npm install -g alia
```

## Usage

```bash
$ al --help
```

### Gist sync

Alia allows you to backup/restore config from a [gist](http://gist.github.com) using the commands:

- `al --sync push` to backup your config (push to gist)
- `al --sync pull` to restore your config (pull from gist)

To get started:

1. Create a new [gist](http://gist.github.com) with a file titled `alia.json`.
2. Create a new [GitHub token](https://github.com/settings/tokens) with the 'gist' permission.
3. Setup Alia with the following commands:

```bash
al --conf token <api token>
al --conf gist <32-char gist id>
```

## Developing
These instructions will help get you up and running with Alia on your local machine.

### Prerequisites

- Node: Version 6 or higher

### Installing
 Single line setup (or follow the steps below)
```bash
git clone https://github.com/edkotkas/alia.git && cd alia && npm i && npm link && al
```

-  Clone the repository (or fork it).
```bash
git clone https://github.com/edkotkas/alia.git && cd alia
```

- Install the NPM packages.
```bash
npm i
```

- (Optional) Symlink the project to your global NPM folder. __This will allow you to run Alia using the cli command ("al").__
```bash
npm link
```

- Run
```bash
$ al --help
```

- Alternatively, without symlink (will still create a global config file in your home directory).
```bash
$ node index --help
```

- Add issues to Github, make changes to the project and create pull requests for review.

### Tests
Run the tests with mocha.
```bash
npm test
```

## License

ISC © [Eduard Kotkas](https://edkotkas.me)
