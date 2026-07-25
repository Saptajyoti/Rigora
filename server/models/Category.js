import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    image: { type: String, trim: true, default: '' },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

categorySchema.pre('validate', function createSlug() {
  if (this.isModified('name'))
    this.slug = slugify(this.name, { lower: true, strict: true, trim: true });
});

export default mongoose.model('Category', categorySchema);
