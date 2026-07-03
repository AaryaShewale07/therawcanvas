import mongoose from 'mongoose'

const commissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    type: {
      type: String,
      enum: ['commission', 'workshop', 'other'],
      default: 'commission',
    },
    subject: { type: String, trim: true },
    message: { type: String, required: true },
    budget: { type: String },
    deadline: { type: Date },
    status: {
      type: String,
      enum: ['new', 'in-progress', 'responded', 'closed'],
      default: 'new',
    },
    adminNotes: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.model('Commission', commissionSchema)