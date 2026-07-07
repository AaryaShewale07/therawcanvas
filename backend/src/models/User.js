import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === 'local'
      },
      minlength: [8, 'Password must be at least 8 characters'],
      validate: {
        validator: function (v) {
          if (this.authProvider === 'google') return true
          if (!this.isModified('password')) return true
          if (!v) return false
          // ✅ Allows ANY special character (matches frontend behavior)
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(v)
        },
        message:
          'Password must contain uppercase, lowercase, number, and special character',
      },
      select: false,
    },
    avatar: {
      type: String,
      default: null,
    },
    avatarPublicId: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      country: { type: String, default: '' },
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    twoFactorAuth: {
      enabled: { type: Boolean, default: false },
      secret: { type: String, select: false },
      backupCodes: { type: [String], select: false },
    },
    activeSessions: [
      {
        token: String,
        device: String,
        browser: String,
        ip: String,
        location: String,
        lastActive: Date,
        rememberMe: Boolean,
      },
    ],
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
      index: true,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    // ⭐ Referral system fields
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    referralStats: {
      totalReferred: { type: Number, default: 0 },
      totalRewarded: { type: Number, default: 0 },
      totalEarned: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next()
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// ⭐ Auto-generate PROFESSIONAL referral code (TRC + 6 chars: letters + numbers)
userSchema.pre('save', async function (next) {
  if (this.isNew && !this.referralCode) {
    const generateCode = () => {
      // Safe chars only — no 0/O/1/I to avoid confusion
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      const prefix = 'TRC' // The Raw Canvas
      let code = prefix
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return code
    }

    // Ensure uniqueness (max 10 attempts)
    let code
    let exists = true
    let attempts = 0
    while (exists && attempts < 10) {
      code = generateCode()
      exists = await mongoose.model('User').findOne({ referralCode: code })
      attempts++
    }
    this.referralCode = code
  }
  next()
})

userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false
  return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.getDefaultAvatar = function () {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    this.name || 'User'
  )}&background=D4A574&color=fff&size=200`
}

const User = mongoose.model('User', userSchema)

export default User