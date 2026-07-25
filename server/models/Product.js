import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 10000 },
    shortDescription: { type: String, trim: true, maxlength: 500, default: '' },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
      index: true,
    },
    sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0, default: null },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: [{ type: String, trim: true }],
    specifications: { type: Map, of: String, default: {} },
    featured: { type: Boolean, default: false, index: true },
    newArrival: { type: Boolean, default: false, index: true },
    bestSeller: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    ratingDistribution: {
      one: { type: Number, default: 0 },
      two: { type: Number, default: 0 },
      three: { type: Number, default: 0 },
      four: { type: Number, default: 0 },
      five: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

productSchema.pre('validate', function createSlug() {
  if (this.isModified('name'))
    this.slug = slugify(this.name, { lower: true, strict: true, trim: true });
});
productSchema.index({ name: 'text', description: 'text', sku: 'text' });
export default mongoose.model('Product', productSchema);
