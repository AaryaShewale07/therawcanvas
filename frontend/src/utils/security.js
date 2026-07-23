// ⚠️ Only enable in production
export const enableSecurityProtection = () => {
  if (import.meta.env.VITE_DISABLE_INSPECT !== 'true') return
  // 1. Disable right-click
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    return false
  })

  // 2. Disable common shortcuts
  document.addEventListener('keydown', (e) => {
    // F12 — DevTools
    if (e.key === 'F12') {
      e.preventDefault()
      return false
    }

    // Ctrl+Shift+I — DevTools
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault()
      return false
    }

    // Ctrl+Shift+J — Console
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault()
      return false
    }

    // Ctrl+Shift+C — Inspect Element
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault()
      return false
    }

    // Ctrl+U — View Source
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault()
      return false
    }

    // Ctrl+S — Save Page
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      return false
    }
  })

  // 3. Detect DevTools (clear console)
  setInterval(() => {
    console.clear()
  }, 1000)

  // 4. Disable text selection (optional - might hurt UX)
  // document.body.style.userSelect = 'none'

  // 5. Disable drag of images
  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault()
    }
  })
}