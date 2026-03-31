import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    HiOutlineUser,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineLocationMarker,
    HiOutlineCamera,
    HiOutlinePencil,
    HiOutlineCheck,
    HiOutlineX,
    HiOutlinePhotograph,
    HiOutlineTrash
} from 'react-icons/hi'
import { useAuth } from '../../context/AuthContext'
import { pageTransition } from '../../utils/animations'
import toast from 'react-hot-toast'

const Profile = () => {
    const { user, setUser } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const [imagePreview, setImagePreview] = useState(null)
    const [selectedFile, setSelectedFile] = useState(null)
    const fileInputRef = useRef(null)

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: {
            street: user?.address?.street || '',
            city: user?.address?.city || '',
            state: user?.address?.state || '',
            zipCode: user?.address?.zipCode || '',
            country: user?.address?.country || '',
        }
    })

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: {
                    street: user.address?.street || '',
                    city: user.address?.city || '',
                    state: user.address?.state || '',
                    zipCode: user.address?.zipCode || '',
                    country: user.address?.country || '',
                }
            })
        }
    }, [user])

    const handleChange = (e) => {
        const { name, value } = e.target
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1]
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const token = localStorage.getItem('token')

            const res = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                }),
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.message || 'Update failed')

            setUser(data.data.user)
            localStorage.setItem('user', JSON.stringify(data.data.user))

            toast.success('Profile updated successfully!')
            setIsEditing(false)

        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = () => {
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            address: {
                street: user?.address?.street || '',
                city: user?.address?.city || '',
                state: user?.address?.state || '',
                zipCode: user?.address?.zipCode || '',
                country: user?.address?.country || '',
            }
        })
        setIsEditing(false)
    }

    // Image Upload Functions
    const openImageModal = () => {
        setIsImageModalOpen(true)
        setImagePreview(null)
        setSelectedFile(null)
    }

    const closeImageModal = () => {
        setIsImageModalOpen(false)
        setImagePreview(null)
        setSelectedFile(null)
    }

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file')
                return
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB')
                return
            }

            setSelectedFile(file)

            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()

        const file = e.dataTransfer.files[0]
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file')
                return
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB')
                return
            }

            setSelectedFile(file)

            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleImageUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select an image')
            return
        }

        setIsUploadingImage(true)

        try {
            const token = localStorage.getItem('token')
            const formData = new FormData()
            formData.append('avatar', selectedFile)

            const res = await fetch('http://localhost:5000/api/auth/avatar', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.message || 'Upload failed')

            // Update user with new avatar
            const updatedUser = { ...user, avatar: data.data.avatar }
            setUser(updatedUser)
            localStorage.setItem('user', JSON.stringify(updatedUser))

            toast.success('Profile image updated successfully!')
            closeImageModal()

        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsUploadingImage(false)
        }
    }

    const handleRemoveAvatar = async () => {
        if (!window.confirm('Are you sure you want to remove your profile picture?')) {
            return
        }

        setIsUploadingImage(true)

        try {
            const token = localStorage.getItem('token')

            const res = await fetch('http://localhost:5000/api/auth/avatar', {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.message || 'Remove failed')

            // Update user with default avatar
            const updatedUser = { ...user, avatar: data.data.avatar }
            setUser(updatedUser)
            localStorage.setItem('user', JSON.stringify(updatedUser))

            toast.success('Profile image removed!')
            closeImageModal()

        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsUploadingImage(false)
        }
    }

    return (
        <motion.div
            variants={pageTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="pt-24 pb-16"
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-heading font-bold text-chocolate-900 mb-4">
                        My Profile
                    </h1>
                    <p className="text-chocolate-600">
                        Manage your account information and preferences
                    </p>
                </motion.div>

                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl shadow-elegant overflow-hidden"
                >
                    {/* Cover & Avatar */}
                    <div className="relative h-40 bg-gradient-to-r from-primary-500 via-gold-500 to-chocolate-600">
                        <div className="absolute -bottom-16 left-8">
                            <div className="relative group">
                                <img
                                    src={user?.avatar}
                                    alt={user?.name}
                                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                                />
                                {/* Camera Button - Opens Modal */}
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={openImageModal}
                                    className="absolute bottom-2 right-2 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-600 transition-colors"
                                >
                                    <HiOutlineCamera className="w-5 h-5" />
                                </motion.button>

                                {/* Hover Overlay */}
                                <div 
                                    onClick={openImageModal}
                                    className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                                >
                                    <HiOutlineCamera className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsEditing(!isEditing)}
                            className="absolute top-4 right-4 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center gap-2 hover:bg-white/30 transition-colors"
                        >
                            <HiOutlinePencil className="w-4 h-4" />
                            Edit Profile
                        </motion.button>
                    </div>

                    {/* User Info */}
                    <div className="pt-20 px-8 pb-8">
                        <div className="mb-8">
                            <h2 className="text-2xl font-heading font-bold text-chocolate-900">
                                {user?.name}
                            </h2>
                            <p className="text-chocolate-500">{user?.email}</p>
                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${user?.role === 'admin'
                                ? 'bg-gold-100 text-gold-700'
                                : 'bg-primary-100 text-primary-700'
                                }`}>
                                {user?.role === 'admin' ? '👑 Admin' : '👤 Member'}
                            </span>
                        </div>

                        {/* Profile Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-chocolate-700 mb-2">
                                        <HiOutlineUser className="inline w-4 h-4 mr-2" />
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={`input-field ${!isEditing && 'bg-cream-50 cursor-not-allowed'}`}
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-chocolate-700 mb-2">
                                        <HiOutlineMail className="inline w-4 h-4 mr-2" />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        disabled
                                        className="input-field bg-cream-50 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-chocolate-400 mt-1">Email cannot be changed</p>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-chocolate-700 mb-2">
                                        <HiOutlinePhone className="inline w-4 h-4 mr-2" />
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder="Enter phone number"
                                        className={`input-field ${!isEditing && 'bg-cream-50 cursor-not-allowed'}`}
                                    />
                                </div>

                                {/* Country */}
                                <div>
                                    <label className="block text-sm font-medium text-chocolate-700 mb-2">
                                        <HiOutlineLocationMarker className="inline w-4 h-4 mr-2" />
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        name="address.country"
                                        value={formData.address.country}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder="Enter country"
                                        className={`input-field ${!isEditing && 'bg-cream-50 cursor-not-allowed'}`}
                                    />
                                </div>

                                {/* Street Address */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-chocolate-700 mb-2">
                                        Street Address
                                    </label>
                                    <input
                                        type="text"
                                        name="address.street"
                                        value={formData.address.street}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder="Enter street address"
                                        className={`input-field ${!isEditing && 'bg-cream-50 cursor-not-allowed'}`}
                                    />
                                </div>

                                {/* City */}
                                <div>
                                    <label className="block text-sm font-medium text-chocolate-700 mb-2">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="address.city"
                                        value={formData.address.city}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder="Enter city"
                                        className={`input-field ${!isEditing && 'bg-cream-50 cursor-not-allowed'}`}
                                    />
                                </div>

                                {/* State */}
                                <div>
                                    <label className="block text-sm font-medium text-chocolate-700 mb-2">
                                        State / Province
                                    </label>
                                    <input
                                        type="text"
                                        name="address.state"
                                        value={formData.address.state}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder="Enter state"
                                        className={`input-field ${!isEditing && 'bg-cream-50 cursor-not-allowed'}`}
                                    />
                                </div>

                                {/* Zip Code */}
                                <div>
                                    <label className="block text-sm font-medium text-chocolate-700 mb-2">
                                        ZIP / Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        name="address.zipCode"
                                        value={formData.address.zipCode}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        placeholder="Enter ZIP code"
                                        className={`input-field ${!isEditing && 'bg-cream-50 cursor-not-allowed'}`}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {isEditing && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-cream-200"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="button"
                                        onClick={handleCancel}
                                        className="flex items-center gap-2 px-6 py-3 border-2 border-chocolate-300 text-chocolate-700 rounded-xl hover:border-chocolate-400 transition-colors"
                                    >
                                        <HiOutlineX className="w-5 h-5" />
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <HiOutlineCheck className="w-5 h-5" />
                                                Save Changes
                                            </>
                                        )}
                                    </motion.button>
                                </motion.div>
                            )}
                        </form>
                    </div>
                </motion.div>

                {/* Account Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
                >
                    {[
                        { label: 'Orders', value: '12', icon: '📦' },
                        { label: 'Wishlist', value: '8', icon: '❤️' },
                        { label: 'Reviews', value: '5', icon: '⭐' },
                        { label: 'Points', value: '450', icon: '🎁' },
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-2xl shadow-elegant p-6 text-center"
                        >
                            <span className="text-3xl mb-2 block">{stat.icon}</span>
                            <p className="text-2xl font-bold text-chocolate-900">{stat.value}</p>
                            <p className="text-sm text-chocolate-500">{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Image Upload Modal */}
            <AnimatePresence>
                {isImageModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-900/60 backdrop-blur-sm"
                        onClick={closeImageModal}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-cream-100 flex items-center justify-between">
                                <h2 className="text-xl font-heading font-bold text-chocolate-900">
                                    Update Profile Picture
                                </h2>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={closeImageModal}
                                    className="p-2 hover:bg-cream-100 rounded-full transition-colors"
                                >
                                    <HiOutlineX className="w-5 h-5 text-chocolate-500" />
                                </motion.button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6">
                                {/* Current Avatar */}
                                <div className="flex justify-center mb-6">
                                    <div className="relative">
                                        <img
                                            src={imagePreview || user?.avatar}
                                            alt="Profile"
                                            className="w-32 h-32 rounded-full object-cover border-4 border-cream-200"
                                        />
                                        {imagePreview && (
                                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                                <HiOutlineCheck className="w-5 h-5 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Upload Area */}
                                <div
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-cream-300 rounded-2xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-cream-50 transition-all"
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    
                                    <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <HiOutlinePhotograph className="w-8 h-8 text-chocolate-400" />
                                    </div>
                                    
                                    <p className="text-chocolate-700 font-medium mb-1">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-sm text-chocolate-400">
                                        PNG, JPG or GIF (max. 5MB)
                                    </p>

                                    {selectedFile && (
                                        <div className="mt-4 p-3 bg-green-50 rounded-xl">
                                            <p className="text-sm text-green-700 font-medium">
                                                ✓ {selectedFile.name}
                                            </p>
                                            <p className="text-xs text-green-600">
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-3 mt-6">
                                    {/* Upload Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleImageUpload}
                                        disabled={!selectedFile || isUploadingImage}
                                        className="w-full py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isUploadingImage ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <HiOutlineCheck className="w-5 h-5" />
                                                Save New Picture
                                            </>
                                        )}
                                    </motion.button>

                                    {/* Remove Current Picture */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleRemoveAvatar}
                                        disabled={isUploadingImage}
                                        className="w-full py-3 border-2 border-red-300 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <HiOutlineTrash className="w-5 h-5" />
                                        Remove Current Picture
                                    </motion.button>

                                    {/* Cancel */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={closeImageModal}
                                        className="w-full py-3 text-chocolate-600 font-medium hover:text-chocolate-800 transition-colors"
                                    >
                                        Cancel
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default Profile