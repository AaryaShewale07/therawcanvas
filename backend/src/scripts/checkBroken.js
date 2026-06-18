import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Try loading from multiple possible locations
dotenv.config({ path: path.resolve(__dirname, '../../.env') })
dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config()

const MONGO = process.env.MONGO_URI || process.env.MONGODB_URI

if (!MONGO) {
  console.error('❌ MONGO_URI not found in env. Check your .env file.')
  console.log('Available env vars starting with MONGO:', 
    Object.keys(process.env).filter(k => k.includes('MONGO')))
  process.exit(1)
}

await mongoose.connect(MONGO)
console.log('✅ Connected\n')

const db = mongoose.connection.db
const collections = await db.listCollections().toArray()

for (const c of collections) {
  const name = c.name
  const docs = await db.collection(name).find({}).toArray()
  const broken = docs.filter(d => JSON.stringify(d).includes('localhost'))
  
  if (broken.length > 0) {
    console.log(`\n🔴 ${name}: ${broken.length} docs contain "localhost"`)
    broken.slice(0, 3).forEach(d => {
      const str = JSON.stringify(d)
      const matches = str.match(/http:\/\/localhost:\d+\/[^"]+/g) || []
      console.log(`   _id: ${d._id}`)
      matches.slice(0, 5).forEach(m => console.log(`     → ${m}`))
    })
  } else {
    console.log(`✅ ${name}: clean`)
  }
}

process.exit(0)