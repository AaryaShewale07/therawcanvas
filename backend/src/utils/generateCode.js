export const generateCouponCode = (prefix = 'REF') => {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}${random}`
}