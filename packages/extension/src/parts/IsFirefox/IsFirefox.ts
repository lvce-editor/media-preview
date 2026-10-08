export const getIsFirefox = (): boolean => {
  if (typeof navigator === 'undefined') {
    return false
  }
  if (
    // @ts-ignore
    navigator.userAgentData &&
    // @ts-ignore
    navigator.userAgentData.brands
  ) {
    // @ts-ignore
    return navigator.userAgentData.brands.includes('Firefox')
  }
  return navigator.userAgent.toLowerCase().includes('firefox')
}
