# Alia [![Build Status](https://travis-ci.org/edkotkas/alia.svg?branch=master)](https://travis-ci.org/edkotkas/alia)

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

    --add, -a         add alias (add -p for project alias)
    --remove, -r      remove alias (add -p for project alias)
    --project, -p     create project alia config
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

## License

ISC © [Eduard Kotkas](https://edkotkas.me)
