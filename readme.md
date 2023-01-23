# Alia 
[![install size](https://packagephobia.com/badge?p=alia)](https://packagephobia.com/result?p=@edkotkas/alia)
[![c8 config on GitHub](https://img.shields.io/nycrc/edkotkas/alia?config=.c8rc.json)](coverage\index.html)
[![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/@edkotkas/alia)](https://img.shields.io/snyk/vulnerabilities/npm/@edkotkas/alia)
[![npm](https://img.shields.io/npm/v/@edkotkas/alia)](https://www.npmjs.com/package/@edkotkas/alia)

## Alias To Go

Simple and lightweight cross-platform Alias solution w/ Gist Sync support in Node.

> Warning, this is an experimental tool. Use at your own discretion.

## Install

```bash
npm install -g @edkotkas/alia
```

## Usage

```bash
al --help
```

### Gist sync

Alia allows you to backup/restore config from a [gist](http://gist.github.com) using the commands:

- `al --sync --push` to backup your config (push to gist)
- `al --sync --pull` to restore your config (pull from gist)

To get started:

1. Create a new [Gist](http://gist.github.com) with a file titled `.alia.json`.
2. Create a new [GitHub token](https://github.com/settings/tokens) with the `gist` permission.
3. Setup Alia with the following commands:

```bash
al --conf --token=<api token> --gist=<gist id>
```

## Developing
Get up and running with Alia on your local machine.

### Prerequisites

- Node: Version 19 or higher

### Installing
-  Clone the repository (or fork it)
```bash
git clone https://github.com/edkotkas/alia.git && cd alia
```

- Install the dev dependencies
```bash
npm i
```

- Run the script (will create a global config file in your home directory)
```bash
npm start -- --help
```

- Add issues to Github, make changes to the project and create pull requests for review

### Tests
Run the tests
```bash
npm test
```

## License

ISC © [Eduard Kotkas](https://edkotkas.me)
