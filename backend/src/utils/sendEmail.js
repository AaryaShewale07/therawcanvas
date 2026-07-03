import dotenv from 'dotenv'
dotenv.config()

// ── Validate env vars ─────────────────────────────────────────────────────────
if (!process.env.BREVO_API_KEY) {
  throw new Error('BREVO_API_KEY must be set in .env')
}
if (!process.env.BREVO_SENDER_EMAIL) {
  throw new Error('BREVO_SENDER_EMAIL must be set in .env')
}

// ── Brevo endpoints ───────────────────────────────────────────────────────────
const BREVO_BASE = 'https://api.brevo.com/v3'
const BREVO_SMTP_URL = `${BREVO_BASE}/smtp/email`
const BREVO_CONTACTS_URL = `${BREVO_BASE}/contacts`
const BREVO_CAMPAIGNS_URL = `${BREVO_BASE}/emailCampaigns`

// ── Common headers ────────────────────────────────────────────────────────────
const brevoHeaders = {
  accept: 'application/json',
  'api-key': process.env.BREVO_API_KEY,
  'content-type': 'application/json',
}

// ── Default sender ────────────────────────────────────────────────────────────
const DEFAULT_SENDER = {
  name: process.env.BREVO_SENDER_NAME || 'TheRawCanvasStudio',
  email: process.env.BREVO_SENDER_EMAIL,
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. SEND TRANSACTIONAL EMAIL (welcome, notifications, etc.)
// ═══════════════════════════════════════════════════════════════════════════════
const sendEmail = async ({ to, subject, html }) => {
  const recipients = Array.isArray(to)
    ? to.map((email) => (typeof email === 'string' ? { email } : email))
    : [{ email: to }]

  const payload = {
    sender: DEFAULT_SENDER,
    to: recipients,
    subject,
    htmlContent: html,
  }

  try {
    const res = await fetch(BREVO_SMTP_URL, {
      method: 'POST',
      headers: brevoHeaders,
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('❌ Brevo email failed:', data)
      throw new Error(data.message || 'Brevo API error')
    }

    console.log('📧 Email sent via Brevo →', to, '| messageId:', data.messageId)
    return data
  } catch (error) {
    console.error('❌ Email send error:', error.message)
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. ADD CONTACT TO BREVO LIST (auto-sync subscribers)
// ═══════════════════════════════════════════════════════════════════════════════
export const addContactToBrevo = async (email, attributes = {}) => {
  const listId = parseInt(process.env.BREVO_NEWSLETTER_LIST_ID)

  if (!listId) {
    console.warn('⚠️  BREVO_NEWSLETTER_LIST_ID not set, skipping contact sync')
    return null
  }

  try {
    const res = await fetch(BREVO_CONTACTS_URL, {
      method: 'POST',
      headers: brevoHeaders,
      body: JSON.stringify({
        email,
        attributes,
        listIds: [listId],
        updateEnabled: true, // updates if already exists
      }),
    })

    const data = await res.json()

    // Brevo returns 400 if duplicate when updateEnabled is false, ignore that
    if (!res.ok && data.code !== 'duplicate_parameter') {
      console.error('❌ Brevo contact add failed:', data)
      return null
    }

    console.log('✅ Contact synced to Brevo list:', email)
    return data
  } catch (err) {
    console.error('❌ Brevo contact sync error:', err.message)
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. REMOVE CONTACT FROM BREVO LIST (when user unsubscribes)
// ═══════════════════════════════════════════════════════════════════════════════
export const removeContactFromBrevo = async (email) => {
  try {
    const res = await fetch(
      `${BREVO_CONTACTS_URL}/${encodeURIComponent(email)}`,
      {
        method: 'DELETE',
        headers: brevoHeaders,
      }
    )

    if (!res.ok && res.status !== 404) {
      const data = await res.json()
      console.error('❌ Brevo contact remove failed:', data)
      return false
    }

    console.log('✅ Contact removed from Brevo:', email)
    return true
  } catch (err) {
    console.error('❌ Brevo contact remove error:', err.message)
    return false
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. CREATE & SEND CAMPAIGN (broadcast email to all subscribers)
// ═══════════════════════════════════════════════════════════════════════════════
export const sendCampaign = async ({ name, subject, htmlContent, sendNow = true }) => {
  const listId = parseInt(process.env.BREVO_NEWSLETTER_LIST_ID)

  if (!listId) {
    throw new Error('BREVO_NEWSLETTER_LIST_ID must be set in .env')
  }

  try {
    // Step 1: Create the campaign
    const createRes = await fetch(BREVO_CAMPAIGNS_URL, {
      method: 'POST',
      headers: brevoHeaders,
      body: JSON.stringify({
        name: name || `Campaign ${new Date().toISOString()}`,
        subject,
        sender: DEFAULT_SENDER,
        type: 'classic',
        htmlContent,
        recipients: { listIds: [listId] },
      }),
    })

    const created = await createRes.json()

    if (!createRes.ok) {
      console.error('❌ Campaign creation failed:', created)
      throw new Error(created.message || 'Campaign creation failed')
    }

    console.log('✅ Campaign created with ID:', created.id)

    // Step 2: Send immediately if requested
    if (sendNow) {
      const sendRes = await fetch(`${BREVO_CAMPAIGNS_URL}/${created.id}/sendNow`, {
        method: 'POST',
        headers: brevoHeaders,
      })

      if (!sendRes.ok) {
        const sendData = await sendRes.json()
        console.error('❌ Campaign send failed:', sendData)
        throw new Error(sendData.message || 'Campaign send failed')
      }

      console.log('🚀 Campaign sent! ID:', created.id)
    }

    return { campaignId: created.id, sent: sendNow }
  } catch (err) {
    console.error('❌ Campaign error:', err.message)
    throw err
  }
}

export default sendEmail