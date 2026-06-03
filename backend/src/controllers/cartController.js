import Cart from '../models/Cart.js'
import Post from '../models/Post.js'

// GET /api/cart
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.post')
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] })
    res.json({ success: true, cart })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/cart/add
export const addToCart = async (req, res) => {
  try {
    const { postId, quantity = 1 } = req.body
    const post = await Post.findById(postId)
    if (!post) return res.status(404).json({ success: false, message: 'Product not found' })

    let cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ post: postId, quantity }],
      })
    } else {
      const idx = cart.items.findIndex((i) => i.post.toString() === postId)
      if (idx > -1) {
        cart.items[idx].quantity += quantity
      } else {
        cart.items.push({ post: postId, quantity })
      }
      await cart.save()
    }
    await cart.populate('items.post')
    res.json({ success: true, cart })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// PUT /api/cart/update
export const updateCartQty = async (req, res) => {
  try {
    const { postId, quantity } = req.body
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' })

    const item = cart.items.find((i) => i.post.toString() === postId)
    if (!item) return res.status(404).json({ success: false, message: 'Item not in cart' })

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.post.toString() !== postId)
    } else {
      item.quantity = quantity
    }
    await cart.save()
    await cart.populate('items.post')
    res.json({ success: true, cart })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// DELETE /api/cart/remove/:postId
export const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' })

    cart.items = cart.items.filter((i) => i.post.toString() !== req.params.postId)
    await cart.save()
    await cart.populate('items.post')
    res.json({ success: true, cart })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// DELETE /api/cart/clear
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
    if (cart) {
      cart.items = []
      await cart.save()
    }
    res.json({ success: true, cart })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}