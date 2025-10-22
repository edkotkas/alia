import type { GistResponse } from '../models/gist-response.model.js'
import https from 'node:https'

const baseUrl = `https://api.github.com/gists/`

function call(id: string, options: https.RequestOptions, postData?: string): Promise<GistResponse> {
  return new Promise((resolve, reject) => {
    const req = https.request(`${baseUrl}${id}`, options, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(res.statusMessage))
        return
      }

      res.setEncoding('utf8')
      const body: string[] = []

      res.on('data', (data: string) => body.push(data))
      res.on('end', () => {
        resolve(JSON.parse(body.join('')) as GistResponse)
      })
    })

    if (postData) {
      req.write(postData)
    }

    req.end()
  })
}

export const request = { call }
