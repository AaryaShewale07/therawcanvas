import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import dotenv from 'dotenv'

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

console.log("===== CLOUDINARY CONFIG =====");
console.log({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "Loaded" : "Missing",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "Loaded" : "Missing",
});
console.log("=============================");

// ⭐ Gallery storage for Cloudinary
export const galleryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/')
    return {
      folder: 'therawcanvas/gallery',
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: isVideo
        ? ['mp4', 'mov', 'webm', 'm4v', 'ogg']
        : ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      public_id: `gallery-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    }
  },
})

export default cloudinary