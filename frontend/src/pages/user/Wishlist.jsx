import { Link } from 'react-router-dom'
import { Heart, Trash2 } from 'lucide-react'
import { useWishlist } from '../../context/WishlistContext'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

const Wishlist = () => {
  const { wishlist, toggleWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <Heart size={80} className="mx-auto text-red-300 mb-4" />
        <h2 className="text-3xl font-bold text-amber-900 mb-3">Please login</h2>
        <p className="text-gray-600 mb-6">Login to see your wishlist</p>
        <Link to="/" className="bg-amber-700 text-white px-8 py-3 rounded-full inline-block">
          Go Home
        </Link>
      </div>
    )
  }

  if (!wishlist.posts || wishlist.posts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <Heart size={80} className="mx-auto text-red-300 mb-4" />
        <h2 className="text-3xl font-bold text-amber-900 mb-3">Your wishlist is empty</h2>
        <p className="text-gray-600 mb-6">Save your favorite items here!</p>
        <Link to="/art" className="bg-amber-700 text-white px-8 py-3 rounded-full inline-block hover:bg-amber-800">
          Browse Art
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-amber-900 mb-8">
        My Wishlist ({wishlist.posts.length})
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.posts.map((post) => (
          <div
            key={post._id}
            className="bg-white rounded-2xl shadow-md overflow-hidden group hover:shadow-xl transition"
          >
            <Link to={`/product/${post._id}`} className="block relative">
              <img
                src={post.images?.[0]?.url || '/placeholder.png'}
                alt={post.title}
                className="w-full h-64 object-cover group-hover:scale-105 transition"
              />
              <button
                onClick={(e) => {
                  e.preventDefault()
                  toggleWishlist(post._id)
                }}
                className="absolute top-3 right-3 bg-white p-2 rounded-full shadow hover:bg-red-50"
              >
                <Trash2 size={18} className="text-red-500" />
              </button>
            </Link>

            <div className="p-4">
              <h3 className="font-bold text-amber-900 text-lg">{post.title}</h3>
              {post.artist && (
                <p className="text-sm text-amber-700">by {post.artist}</p>
              )}
              <div className="flex items-center justify-between mt-3">
                <p className="font-bold text-amber-900">₹{post.price}</p>
                <button
                  onClick={() => addToCart(post._id, 1)}
                  className="bg-amber-700 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-amber-800 transition"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Wishlist