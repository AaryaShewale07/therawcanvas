import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ⭐ Load .env from backend root (2 levels up from src/scripts/)
const envPath = path.join(__dirname, '..', '..', '.env')
dotenv.config({ path: envPath })

import mongoose from 'mongoose'
import fs from 'fs'
import Gallery from '../models/Gallery.js'

const run = async () => {
  try {
    // ⭐ Try common variable names
    const mongoUri =
      process.env.MONGO_URI ||
      process.env.MONGODB_URI ||
      process.env.DB_URI ||
      process.env.DATABASE_URL ||
      process.env.MONGO_URL

    if (!mongoUri) {
      console.error('❌ MongoDB URI not found in .env')
      console.error('   Checked path:', envPath)
      console.error('\n📋 Available env variables:')
      Object.keys(process.env)
        .filter((k) => !k.startsWith('npm_') && !k.startsWith('PATH'))
        .forEach((k) => {
          const val = process.env[k]
          const preview = val && val.length > 40 ? val.substring(0, 40) + '...' : val
          console.error(`   ${k} = ${preview}`)
        })
      process.exit(1)
    }

    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB\n')

    // Path to uploads folder
    const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'gallery')
    console.log(`📂 Checking folder: ${uploadsDir}`)

    if (!fs.existsSync(uploadsDir)) {
      console.error(`❌ Folder doesn't exist: ${uploadsDir}`)
      process.exit(1)
    }

    const allFiles = fs.readdirSync(uploadsDir).sort()
    const images = allFiles.filter((f) => /\.(png|jpg|jpeg|webp|gif)$/i.test(f))
    const videos = allFiles.filter((f) => /\.(mp4|mov|webm|m4v|ogg)$/i.test(f))

    console.log(`📁 Found ${allFiles.length} files total`)
    console.log(`   🖼️  Images: ${images.length}`)
    console.log(`   🎬 Videos: ${videos.length}\n`)

    if (allFiles.length === 0) {
      console.error('❌ No files found in uploads folder!')
      process.exit(1)
    }

    const events = await Gallery.find({}).sort({ createdAt: 1 })
    console.log(`📊 Found ${events.length} events in database\n`)

    if (events.length === 0) {
      console.log('⚠️  No events to update')
      process.exit(0)
    }

    for (let i = 0; i < events.length; i++) {
      const event = events[i]
      const newImageList = []

      if (i === 0) {
        const share = Math.ceil(images.length / events.length)
        for (let j = 0; j < share && j < images.length; j++) {
          newImageList.push(`/uploads/gallery/${images[j]}`)
        }
      } else {
        const startIdx = Math.ceil(images.length / events.length)
        for (let j = startIdx; j < images.length; j++) {
          newImageList.push(`/uploads/gallery/${images[j]}`)
        }
        videos.forEach((v) => newImageList.push(`/uploads/gallery/${v}`))
      }

      if (newImageList.length === 0 && images.length > 0) {
        newImageList.push(`/uploads/gallery/${images[0]}`)
      }

      event.images = newImageList
      await event.save()

      console.log(`✅ "${event.title}" → ${newImageList.length} files:`)
      newImageList.forEach((img) => console.log(`   • ${img.split('/').pop()}`))
      console.log('')
    }

    console.log('✨ All done! Reload your gallery page to see the images.\n')
    process.exit(0)
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

run()