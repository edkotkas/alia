import type { Interface } from 'node:readline/promises'
import type { RLWrapper } from '../models/rl-wrapper.model'

export const read: RLWrapper = {
  question: (rli: Interface, question: string): Promise<string> => rli.question(question)
}
