import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Eye, ShoppingBag, Plus, Minus } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'

const GalleryItem = ({ post }) => {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const [quantity, setQuantity] = useState(1)
  const [showQty, setShowQty] = useState(false)

  const liked = isInWishlist(post._id)
  const image = post.images?.[0]?.url || '/placeholder.png'

  const handleAddToCart = async (e) => {
    e.stopPropagation()
    const ok = await addToCart(post._id, quantity)
    if (ok) setShowQty(false)
  }

  const handleWishlist = (e) => {
    e.stopPropagation()
    toggleWishlist(post._id)
  }

  const handlePreview = (e) => {
    e.stopPropagation()
    navigate(`/product/${post._id}`)
  }

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
      {/* Tags */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        {post.isNew && (
          <span className="bg-amber-700 text-white text-xs font-bold px-3 py-1 rounded-md">
            NEW
          </span>
        )}
      </div>
      {post.subCategory && (
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-md">
            {post.subCategory}
          </span>
        </div>
      )}

      {/* Image */}
      <div className="relative overflow-hidden aspect-[3/4]">
        <img
          src={image}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
          onClick={handlePreview}
        />

        {/* Action Buttons */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition"
          >
            <Heart
              size={20}
              className={liked ? 'fill-red-500 text-red-500' : 'text-red-500'}
            />
          </button>

          {/* Preview */}
          <button
            onClick={handlePreview}
            className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition"
          >
            <Eye size={20} className="text-gray-700" />
          </button>

          {/* Cart (with qty toggle) */}
          {showQty ? (
            <div className="flex items-center gap-2 bg-white rounded-full shadow-lg px-2 py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setQuantity(Math.max(1, quantity - 1))
                }}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <Minus size={16} />
              </button>
              <span className="font-bold min-w-[20px] text-center">{quantity}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setQuantity(quantity + 1)
                }}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={handleAddToCart}
                className="bg-amber-700 text-white p-2 rounded-full hover:bg-amber-800 transition"
              >
                <ShoppingBag size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowQty(true)
              }}
              className="bg-amber-700 text-white p-3 rounded-full shadow-lg hover:scale-110 transition"
            >
              <ShoppingBag size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-amber-900">{post.title}</h3>
        {post.artist && (
          <p className="text-sm text-amber-700 mt-1">by {post.artist}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 text-red-500">
            <Heart size={14} className={liked ? 'fill-red-500' : ''} />
            <span className="text-sm">{post.likes || 0}</span>
          </div>
          {post.price > 0 && (
            <p className="font-bold text-amber-900">₹{post.price}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default GalleryItem