const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB'] as const

export const formatBytes = (size: number): string => {
  if (!Number.isFinite(size) || size <= 0) {
    return '0 B'
  }
  let value = size
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex++
  }
  if (unitIndex === 0) {
    return `${Math.trunc(value)} ${units[unitIndex]}`
  }
  const formatted = value >= 10 ? value.toFixed(0) : value.toFixed(1)
  return `${formatted} ${units[unitIndex]}`
}
