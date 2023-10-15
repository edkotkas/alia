export function toBool(data: string[]): boolean | undefined {
  const trues = ['true', '1', 'on', 'yes', 'y']
  const falses = ['false', '0', 'off', 'no', 'n']

  if (!data.length) {
    return true
  }

  if (trues.find((t) => t === data[0])) {
    return true
  }

  if (falses.find((t) => t === data[0])) {
    return false
  }
}
