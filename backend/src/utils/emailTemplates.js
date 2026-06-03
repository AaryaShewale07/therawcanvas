// Beautiful reusable HTML email templates

const baseStyle = `
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #fefdfb;
`

// Reusable header
const header = (title) => `
  <div style="background: linear-gradient(135deg, #471701 0%, #7a4520 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #d4be3e, #b8a430); border-radius: 50%; line-height: 60px; color: #471701; font-weight: bold; font-size: 24px; margin-bottom: 15px;">A&C</div>
    <h1 style="color: #fff; margin: 10px 0 5px; font-size: 28px;">TheRawCanvasStudio</h1>
    <p style="color: #d4be3e; margin: 0; font-style: italic; font-size: 14px;">Handcrafted Elegance</p>
    <h2 style="color: #fff; margin-top: 20px; font-size: 22px;">${title}</h2>
  </div>
`

const footer = `
  <div style="background: #f5f1ea; padding: 25px; text-align: center; border-radius: 0 0 12px 12px; border-top: 3px solid #d4be3e;">
    <p style="color: #7a4520; font-size: 14px; margin: 5px 0;">
      Need help? Reply to this email or WhatsApp us at <strong>+91 82912 71695</strong>
    </p>
    <p style="color: #999; font-size: 12px; margin-top: 15px;">
      © ${new Date().getFullYear()} TheRawCanvasStudio. All rights reserved.
    </p>
    <div style="margin-top: 10px;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="color: #7a4520; text-decoration: none; margin: 0 8px;">Website</a>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders" style="color: #7a4520; text-decoration: none; margin: 0 8px;">My Orders</a>
    </div>
  </div>
`

// Helper: Format zone label
const formatZone = (zone) => {
  const zones = {
    mumbai: 'Mumbai',
    maharashtra: 'Maharashtra',
    india: 'India',
    remote: 'Remote Area',
  }
  return zones[zone] || ''
}

// 1. Welcome Email
export const welcomeEmail = (name) => `
  <div style="${baseStyle}">
    ${header('Welcome to Our Family! 🎉')}
    <div style="padding: 30px; background: white;">
      <p style="font-size: 18px; color: #333;">Hi <strong>${name}</strong>,</p>
      <p style="color: #555; line-height: 1.6;">
        We're thrilled to have you join the TheRawCanvasStudio community! 🌟
      </p>
      <p style="color: #555; line-height: 1.6;">
        Discover our handcrafted collection of artisan chocolates, stunning artworks, and unique gifts — each piece made with love and care.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #471701, #7a4520); color: white; text-decoration: none; border-radius: 30px; font-weight: bold;">
          Explore Collection →
        </a>
      </div>
      <div style="background: #fef9e7; border-left: 4px solid #d4be3e; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #7a4520;">
          <strong>🎁 Welcome Gift:</strong> Enjoy FREE shipping on orders above ₹1000!
        </p>
      </div>
    </div>
    ${footer}
  </div>
`

// 2. Order Confirmation (WITH SHIPPING BREAKDOWN)
export const orderConfirmationEmail = (order, user) => {
  const orderId = order._id.toString().slice(-8).toUpperCase()
  const zoneLabel = formatZone(order.shippingZone)
  const subtotal = order.subtotal || order.totalAmount
  const shippingCost = order.shippingCost || 0

  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <img src="${item.image}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <strong style="color: #471701;">${item.title}</strong><br>
        <small style="color: #999;">Qty: ${item.quantity} × ₹${item.price}</small>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #471701;">
        ₹${item.price * item.quantity}
      </td>
    </tr>
  `).join('')

  return `
    <div style="${baseStyle}">
      ${header('Order Confirmed! ✅')}
      <div style="padding: 30px; background: white;">
        <p style="font-size: 18px; color: #333;">Hi <strong>${user.name}</strong>,</p>
        <p style="color: #555; line-height: 1.6;">
          Thank you for your order! We've received it and will start preparing it right away.
        </p>

        <div style="background: linear-gradient(135deg, #fef9e7 0%, #fef3c7 100%); padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #7a4520; font-size: 14px;">Order Number</p>
          <h2 style="margin: 5px 0; color: #471701; letter-spacing: 2px;">#${orderId}</h2>
          <p style="margin: 0; color: #999; font-size: 13px;">Placed on ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        <h3 style="color: #471701; margin-top: 30px;">📦 Order Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          ${itemsHTML}
          
          <!-- Subtotal Row -->
          <tr>
            <td colspan="2" style="padding: 10px 12px; text-align: right; color: #555; font-size: 14px;">Subtotal:</td>
            <td style="padding: 10px 12px; text-align: right; color: #555; font-size: 14px;">₹${subtotal}</td>
          </tr>
          
          <!-- Shipping Row -->
          <tr>
            <td colspan="2" style="padding: 10px 12px; text-align: right; color: #555; font-size: 14px;">
              🚚 Shipping${zoneLabel ? ` (${zoneLabel})` : ''}:
            </td>
            <td style="padding: 10px 12px; text-align: right; color: ${shippingCost === 0 ? '#16a34a' : '#555'}; font-weight: ${shippingCost === 0 ? 'bold' : 'normal'}; font-size: 14px;">
              ${shippingCost === 0 ? '✓ FREE' : `₹${shippingCost}`}
            </td>
          </tr>
          
          <!-- Total Row -->
          <tr style="border-top: 2px solid #d4be3e;">
            <td colspan="2" style="padding: 15px 12px; text-align: right; font-size: 18px; font-weight: bold; color: #471701;">Total:</td>
            <td style="padding: 15px 12px; text-align: right; font-size: 20px; font-weight: bold; color: #471701;">₹${order.totalAmount}</td>
          </tr>
        </table>

        ${shippingCost === 0 ? `
          <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 12px; border-radius: 8px; margin: 15px 0; text-align: center;">
            <p style="margin: 0; color: #166534; font-weight: bold;">🎉 You enjoyed FREE shipping on this order!</p>
          </div>
        ` : ''}

        <h3 style="color: #471701; margin-top: 25px;">🚚 Shipping To</h3>
        <div style="background: #f5f1ea; padding: 15px; border-radius: 8px;">
          <p style="margin: 0; color: #333;">
            <strong>${order.shippingAddress.name}</strong><br>
            ${order.shippingAddress.street}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br>
            📞 ${order.shippingAddress.phone}
          </p>
        </div>

        ${order.hasCustomization ? `
          <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 8px; color: #166534;"><strong>📸 Action Required!</strong></p>
            <p style="margin: 0; color: #166534; font-size: 14px;">
              Your order includes customized items. Please send your photos via WhatsApp to <strong>+91 82912 71695</strong> with Order ID <strong>#${orderId}</strong>.
            </p>
          </div>
        ` : ''}

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-success/${order._id}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #471701, #7a4520); color: white; text-decoration: none; border-radius: 30px; font-weight: bold;">
            View Order Details
          </a>
        </div>

        <p style="color: #555; font-size: 14px; margin-top: 25px;">
          We'll notify you via email when your order is shipped. 📦
        </p>
      </div>
      ${footer}
    </div>
  `
}

// 3. Order Shipped
export const orderShippedEmail = (order, user) => {
  const orderId = order._id.toString().slice(-8).toUpperCase()
  return `
    <div style="${baseStyle}">
      ${header('Your Order is on the Way! 🚚')}
      <div style="padding: 30px; background: white;">
        <p style="font-size: 18px; color: #333;">Hi <strong>${user.name}</strong>,</p>
        <p style="color: #555; line-height: 1.6;">
          Great news! Your order <strong>#${orderId}</strong> has been shipped and is on its way to you.
        </p>
        <div style="text-align: center; margin: 30px 0; font-size: 80px;">📦🚚💨</div>
        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #1e40af;">Expected delivery: <strong>3-5 business days</strong></p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #471701, #7a4520); color: white; text-decoration: none; border-radius: 30px; font-weight: bold;">
            Track Order
          </a>
        </div>
      </div>
      ${footer}
    </div>
  `
}

// 4. Order Delivered
export const orderDeliveredEmail = (order, user) => {
  const orderId = order._id.toString().slice(-8).toUpperCase()
  return `
    <div style="${baseStyle}">
      ${header('Order Delivered! 🎉')}
      <div style="padding: 30px; background: white;">
        <p style="font-size: 18px; color: #333;">Hi <strong>${user.name}</strong>,</p>
        <p style="color: #555; line-height: 1.6;">
          Your order <strong>#${orderId}</strong> has been delivered! We hope you love it. 💖
        </p>
        <div style="text-align: center; margin: 30px 0; font-size: 80px;">🎁✨😊</div>
        <p style="color: #555; text-align: center;">
          Loved your purchase? We'd appreciate a review!
        </p>
        <div style="background: #fef9e7; border-left: 4px solid #d4be3e; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #7a4520;">
            <strong>💝 Don't forget:</strong> Tag us on Instagram <strong>@therawcanvasstudio</strong> for a chance to be featured!
          </p>
        </div>
      </div>
      ${footer}
    </div>
  `
}

// 5. Order Cancelled
export const orderCancelledEmail = (order, user) => {
  const orderId = order._id.toString().slice(-8).toUpperCase()
  return `
    <div style="${baseStyle}">
      ${header('Order Cancelled')}
      <div style="padding: 30px; background: white;">
        <p style="font-size: 18px; color: #333;">Hi <strong>${user.name}</strong>,</p>
        <p style="color: #555; line-height: 1.6;">
          Your order <strong>#${orderId}</strong> has been cancelled. If you paid online, your refund of <strong>₹${order.totalAmount}</strong> will be processed within 5-7 business days.
        </p>
        <div style="background: #fee2e2; padding: 15px; border-radius: 8px;">
          <p style="margin: 0; color: #991b1b;">If this was a mistake or you need help, please contact us at <strong>therawcanvase@gmail.com</strong> or WhatsApp <strong>+91 82912 71695</strong>.</p>
        </div>
      </div>
      ${footer}
    </div>
  `
}

// 6. Admin notification for new order (WITH SHIPPING DETAILS)
export const adminNewOrderEmail = (order, user) => {
  const orderId = order._id.toString().slice(-8).toUpperCase()
  const zoneLabel = formatZone(order.shippingZone)
  const subtotal = order.subtotal || order.totalAmount
  const shippingCost = order.shippingCost || 0

  return `
    <div style="${baseStyle}">
      ${header('🔔 New Order Received!')}
      <div style="padding: 30px; background: white;">
        <p style="font-size: 16px; color: #333;">A new order has been placed:</p>
        <div style="background: #f5f1ea; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Order ID:</strong> #${orderId}</p>
          <p style="margin: 5px 0;"><strong>Customer:</strong> ${user.name}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.shippingAddress.phone}</p>
          
          <hr style="border: none; border-top: 1px solid #d4be3e; margin: 10px 0;">
          
          <p style="margin: 5px 0;"><strong>Subtotal:</strong> ₹${subtotal}</p>
          <p style="margin: 5px 0;">
            <strong>Shipping${zoneLabel ? ` (${zoneLabel})` : ''}:</strong> 
            ${shippingCost === 0 ? '<span style="color: #16a34a; font-weight: bold;">FREE</span>' : `₹${shippingCost}`}
          </p>
          <p style="margin: 5px 0; font-size: 16px;"><strong>Total Amount:</strong> <span style="color: #471701; font-size: 18px;">₹${order.totalAmount}</span></p>
          
          <hr style="border: none; border-top: 1px solid #d4be3e; margin: 10px 0;">
          
          <p style="margin: 5px 0;"><strong>Payment:</strong> ${order.paymentMethod} (${order.paymentStatus})</p>
          <p style="margin: 5px 0;"><strong>Items:</strong> ${order.items.length}</p>
          ${order.hasCustomization ? '<p style="color: #16a34a; font-weight: bold; margin: 10px 0;">🎨 Includes customization items!</p>' : ''}
        </div>

        <h3 style="color: #471701;">📍 Shipping Address</h3>
        <div style="background: #fef9e7; padding: 15px; border-radius: 8px;">
          <p style="margin: 0; color: #333;">
            <strong>${order.shippingAddress.name}</strong><br>
            ${order.shippingAddress.street}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br>
            📞 ${order.shippingAddress.phone}
          </p>
        </div>

        <div style="text-align: center; margin: 25px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #471701, #7a4520); color: white; text-decoration: none; border-radius: 30px; font-weight: bold;">
            View in Admin Panel
          </a>
        </div>
      </div>
      ${footer}
    </div>
  `
}