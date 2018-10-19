# Alia (WIP) [![Build Status](https://travis-ci.org/edkotkas/alia.svg?branch=master)](https://travis-ci.org/edkotkas/alia)

> Alias To Go

Works on Linux, Windows and maybe macOS (not tried).

## Install

```
$ npm install -g alia
```

## Shell
**Please note:** use single quotes for strings as double quotes will be interpreted by the Shell.
```
$ al -a gcm @ git commit -m
$ al gcm 'init'
```

## Usage

```
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

## License

ISC © [Eduard Kotkas](https://edkotkas.me)
