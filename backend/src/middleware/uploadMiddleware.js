import multer from 'multer'
import path from 'path'

// Configure multer for memory storage (for Cloudinary upload)
const storage = multer.memoryStorage()

// ─── File filter — allows images AND videos ──────────────────────────────────
const fileFilter = (req, file, cb) => {
  // Allowed extensions (images + videos)
  const allowedExtensions = /jpeg|jpg|png|gif|webp|mp4|mov|webm|m4v|ogg|quicktime/

  // Allowed MIME types
  const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    // Videos
    'video/mp4',
    'video/quicktime', // .mov
    'video/webm',
    'video/x-m4v',
    'video/ogg',
  ]

  const extname = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  )
  const mimetype =
    allowedMimeTypes.includes(file.mimetype) ||
    file.mimetype.startsWith('image/') ||
    file.mimetype.startsWith('video/')

  if (extname && mimetype) {
    cb(null, true)
  } else {
    cb(
      new Error(
        `File type not allowed. Use images (JPG, PNG, GIF, WEBP) or videos (MP4, MOV, WEBM). Got: ${file.mimetype}`
      ),
      false
    )
  }
}

// ─── Configure multer ────────────────────────────────────────────────────────
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // ✅ 100MB max (was 5MB) — videos need room
    files: 20, // max 20 files per upload
  },
  fileFilter: fileFilter,
})

export default upload