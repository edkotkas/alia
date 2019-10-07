# Alia [![Build Status](https://travis-ci.org/edkotkas/alia.svg?branch=master)](https://travis-ci.org/edkotkas/alia)

> Alias To Go

Works on Linux, Windows and maybe macOS (not tried).

## Install

```bash
$ npm install -g alia
```

## Usage

```bash
$ al

  Usage
  
    $ al [options] [alias] [@] [command]

  Options
  
    --version, -v     show version
    --help, -h        show this

    --add, -a         add alias
        -x            enable experimental shell
    --edit, -e        edit alias
    --remove, -r      remove alias
    --list, -l        list available alias

    --conf, -c        change alia configuration
      separator [string]                set alias separator (default: @)   
      token <your github api token>     set the api token for gist sync
      gist <your gist id>               set the gist id to use for sync

    --sync, -s        backup/restore your config (default: restore)
      push    backup your current config
      pull    restore config from gist

  Examples
  
    $ al -a gp @ git push
      > Added: gp @ git push

    $ al gp
      > git push

    $ al -r gp
      > Removed: gp
```

#### Experimental Shell (use at your own risk!)
You can add commands with the shell enabled (_al -a -x_) to allow the use of more complex aliases.

Using double quotes, you can combine multiple commands into one.
```bash
$ al -a -x test @ "echo hi && echo bye"
```

This also allows using your existing Alia aliases as an alias.
```bash
$ al -a -x testy @ al test
```

Again, this is experimental and not very secure. Be careful of the commands used in this mode.

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
1. Clone the repository.
```bash
git clone https://github.com/edkotkas/alia.git
cd alia
```

2. Install the NPM packages.
```bash
npm i
```

3. Symlink the project to your global NPM folder. This will allow you to run Alia using the cli command.
```bash
npm link
```
4. Try it out!
```bash
al --help
```

5. Add issues to Github, make changes to the project and create pull requests for review.

### Tests
Run the tests with mocha.
```bash
npm test
```

## License

ISC © [Eduard Kotkas](https://edkotkas.me)
