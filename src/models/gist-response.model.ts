export interface GistResponse {
  updated_at: string
  html_url: string
  files: Record<string, FileContent | undefined>
}

interface FileContent {
  content: string
}
