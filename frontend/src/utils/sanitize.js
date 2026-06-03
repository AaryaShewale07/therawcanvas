// Sanitize user input before displaying
export const escapeHtml = (text) => {
  if (!text) return ''
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return String(text).replace(/[&<>"']/g, (m) => map[m])
}

// Validate email
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Validate phone (Indian)
export const isValidPhone = (phone) => {
  return /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''))
}

// Validate pincode
export const isValidPincode = (pincode) => {
  return /^[1-9][0-9]{5}$/.test(pincode)
}