export const SHIPPING_CONFIG = {
  FREE_SHIPPING_THRESHOLD: 2000,
  zones: {
    mumbai: { name: 'Mumbai (Local)', cost: 150, label: '📍 Mumbai' },
    maharashtra: { name: 'Maharashtra', cost: 200, label: '📍 Maharashtra' },
    india: { name: 'Rest of India', cost: 250, label: '📍 India' },
    remote: { name: 'Remote Areas', cost: 350, label: '📍 Remote' },
  },
}

export const getZoneFromPincode = (pincode) => {
  if (!pincode || pincode.length !== 6) return null

  const code = parseInt(pincode)
  const prefix3 = pincode.substring(0, 3)

  if (code >= 400000 && code <= 401999) return 'mumbai'
  if (code >= 402000 && code <= 445999) return 'maharashtra'

  const remotePrefixes = [
    '190', '191', '192', '193', '194',
    '737', '744',
    '790', '791', '792', '793', '794', '795', '796', '797', '798', '799',
  ]
  if (remotePrefixes.includes(prefix3)) return 'remote'

  if (code >= 100000 && code <= 999999) return 'india'
  return null
}

export const calculateShipping = (pincode, subtotal) => {
  const zone = getZoneFromPincode(pincode)

  if (!zone) {
    return {
      cost: 0,
      zone: null,
      zoneLabel: null,
      isFree: false,
      isValid: false,
      message: 'Enter pincode to calculate shipping',
    }
  }

  const zoneConfig = SHIPPING_CONFIG.zones[zone]

  // FREE shipping above ₹2000
  if (subtotal >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD) {
    return {
      cost: 0,
      zone,
      zoneLabel: zoneConfig.label,
      isFree: true,
      isValid: true,
      message: '🎉 FREE shipping unlocked!',
    }
  }

  // Flat rate per zone
  return {
    cost: zoneConfig.cost,
    zone,
    zoneLabel: zoneConfig.label,
    isFree: false,
    isValid: true,
    message: `Standard shipping to ${zoneConfig.name}`,
  }
}

export const amountForFreeShipping = (subtotal) => {
  const needed = SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD - subtotal
  return needed > 0 ? needed : 0
}

export const freeShippingProgress = (subtotal) => {
  const pct = (subtotal / SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD) * 100
  return Math.min(pct, 100)
}