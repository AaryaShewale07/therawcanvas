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
      required: [true, 'Password is required'],
      minlength: 6,
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
    // Add to user schema
    password: {
      type: String,
      required: true,
      minlength: [8, 'Password must be at least 8 characters'],
      validate: {
        validator: function (v) {
          // At least one uppercase, lowercase, number, special char
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v)
        },
        message: 'Password must contain uppercase, lowercase, number, and special character (@$!%*?&)',
      },
      select: false,
    }
  },

  {
    timestamps: true,
  }
)

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Get default avatar
userSchema.methods.getDefaultAvatar = function () {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name || 'User')}&background=D4A574&color=fff&size=200`
}

const User = mongoose.model('User', userSchema)

export default User