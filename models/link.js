import mongoose from 'mongoose';

const LinkSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        try {
          new URL(v);
          return true;
        } catch(e) {
          return false;
        }
      },
      message: 'Invalid URL format'
    }
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [3, 'Slug must be at least 3 characters long'],
    maxlength: [50, 'Slug cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  lastClickedAt: {
    type: Date
  },
  analytics: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Analytics'
  }
}, {
  timestamps: true
});

LinkSchema.pre('findOne', async function(next) {
  const slug = this.getQuery().slug;
  if (slug) {
    await this.model.updateOne(
      { slug }, 
      { 
        $inc: { clicks: 1 },
        $set: { lastClickedAt: new Date() }
      }
    );
  }
  next();
});

const Link = mongoose.model('Link', LinkSchema);

export default Link;
