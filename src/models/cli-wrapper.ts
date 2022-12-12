import type { Interface } from 'node:readline/promises'

export interface RLWrapper {
  question: (rli: Interface, question: string) => Promise<string>
}
