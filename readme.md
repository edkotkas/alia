# Alia (WIP) [![Build Status](https://travis-ci.org/edkotkas/alia.svg?branch=master)](https://travis-ci.org/edkotkas/alia)

> Alias To Go

Works on Linux, Windows and maybe macOS (not tried).

## Install

```bash
$ npm install -g alia
```

## Shell
**Please note:** use single quotes for strings as double quotes will be interpreted by the Shell.
```bash
$ al -a gcm @ git commit -m
$ al gcm 'init'
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
    --remove, -r      remove alias
    --list, -l        list available alias
    --separator, -s   change the separator (default: @)

  Examples
  
    $ al -a gp @ git push
      > Added: gp @ git push

    $ al gp
      > git push

    $ al -r gp
      > Removed: gp
```

### Gist sync

alia allows you to backup/restore config from a [gist](http://gist.github.com) using the commands:

- `al --push` to backup your config (push to gist)
- `al --pull` to restore your config (pull from gist)

To get started:

1. Create a new [gist](http://gist.github.com) with a blank file title named `alia.json`. Copy the gist id (32-char id in URL) to your config's `options.sync.gistId` value
2. Create a new [GitHub token](https://github.com/settings/tokens) with the 'gist' permission. Use this as the `options.sync.apiToken` value

```json
"sync": {
  "apiToken": "<api token>",
  "gistId": "<32-char gist id>"
}
```

## License

ISC © [Eduard Kotkas](https://edkotkas.me)
