import Wishlist from '../models/Wishlist.js'

// GET /api/wishlist
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('posts')
    if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, posts: [] })
    res.json({ success: true, wishlist })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// POST /api/wishlist/toggle
export const toggleWishlist = async (req, res) => {
  try {
    const { postId } = req.body
    let wishlist = await Wishlist.findOne({ user: req.user._id })

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        posts: [postId],
      })
    } else {
      const exists = wishlist.posts.some((p) => p.toString() === postId)
      if (exists) {
        wishlist.posts = wishlist.posts.filter((p) => p.toString() !== postId)
      } else {
        wishlist.posts.push(postId)
      }
      await wishlist.save()
    }
    await wishlist.populate('posts')
    res.json({ success: true, wishlist })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// DELETE /api/wishlist/:postId
export const removeFromWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id })
    if (!wishlist) return res.status(404).json({ success: false, message: 'Wishlist not found' })

    wishlist.posts = wishlist.posts.filter((p) => p.toString() !== req.params.postId)
    await wishlist.save()
    await wishlist.populate('posts')
    res.json({ success: true, wishlist })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}