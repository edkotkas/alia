# Alia - Alias To Go (WIP)

## Gist sync

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
