export interface GistResponse {
  updated_at: string
  html_url: string
  files: Record<string, {
      content: string
    } | undefined>
}
