import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import Brand from '../models/Brand.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import User from '../models/User.js';
import brands from './brands.js';
import categories from './categories.js';
import productSeeds from './products.js';
import reviewSeeds, { reviewUsers } from './reviews.js';

const seedDirectory = path.dirname(fileURLToPath(import.meta.url));
const productDirectory = path.resolve(seedDirectory, '../../client/public/products');
const manifestPath = path.join(seedDirectory, 'product-image-manifest.json');
const fallbackImage = '/products/placeholder.png';

dotenv.config({ path: path.resolve(seedDirectory, '../.env') });

const writeImageManifest = async () => {
  const manifest = productSeeds.map((product) => {
    const publicPath = product.images?.[0] || fallbackImage;
    const filename = path.basename(publicPath);

    return {
      name: product.name,
      slug: product.slug,
      filename,
      publicPath,
      exists: existsSync(path.join(productDirectory, filename)),
      fallback: fallbackImage,
    };
  });

  await mkdir(productDirectory, { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
};

const upsertByName = async (Model, records) => {
  for (const record of records) {
    const document = (await Model.findOne({ name: record.name })) || new Model();
    Object.assign(document, record);
    await document.save();
  }
};

const ensureReviewUsers = async () => {
  const users = new Map();

  for (const reviewer of reviewUsers) {
    const existingUser = await User.findOne({
      $or: [{ email: reviewer.email }, { username: reviewer.username }],
    });

    if (existingUser) {
      if (
        existingUser.email !== reviewer.email ||
        existingUser.username !== reviewer.username
      ) {
        throw new Error(
          `Cannot create review seed user for ${reviewer.email}: email or username is already in use.`,
        );
      }
      users.set(reviewer.email, existingUser);
      continue;
    }

    const user = await User.create({
      ...reviewer,
      password: 'rigora-development-reviewer-password',
    });
    users.set(reviewer.email, user);
  }

  return users;
};

const refreshRatings = async (productIds) => {
  const stats = await Review.aggregate([
    { $match: { product: { $in: productIds }, status: 'approved' } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
        one: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        two: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        three: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        four: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        five: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
      },
    },
  ]);
  const byProductId = new Map(stats.map((stat) => [stat._id.toString(), stat]));

  await Promise.all(
    productIds.map((productId) => {
      const stat = byProductId.get(productId.toString());
      return Product.findByIdAndUpdate(productId, {
        averageRating: stat?.averageRating || 0,
        reviewCount: stat?.reviewCount || 0,
        ratingDistribution: {
          one: stat?.one || 0,
          two: stat?.two || 0,
          three: stat?.three || 0,
          four: stat?.four || 0,
          five: stat?.five || 0,
        },
      });
    }),
  );
};

async function seed() {
  await writeImageManifest();

  if (process.argv.includes('--manifest-only')) {
    console.log(
      `Rigora product image manifest written: ${productSeeds.length} products.`,
    );
    return;
  }

  if (!process.env.MONGODB_URI)
    throw new Error('MONGODB_URI must be set in server/.env.');
  if (process.env.NODE_ENV === 'production')
    throw new Error('Catalog and review seeds may only run outside production.');

  await mongoose.connect(process.env.MONGODB_URI);

  if (process.argv.includes('--clear')) {
    await Promise.all([
      Product.deleteMany({}),
      Category.deleteMany({}),
      Brand.deleteMany({}),
    ]);
  }

  await upsertByName(Category, categories);
  await upsertByName(Brand, brands);

  const [categoryDocuments, brandDocuments] = await Promise.all([
    Category.find({}, { _id: 1, name: 1 }),
    Brand.find({}, { _id: 1, name: 1 }),
  ]);
  const categoryIds = new Map(
    categoryDocuments.map((category) => [category.name, category._id]),
  );
  const brandIds = new Map(brandDocuments.map((brand) => [brand.name, brand._id]));
  const products = productSeeds.map(({ category, brand, ...product }) => {
    const categoryId = categoryIds.get(category);
    const brandId = brandIds.get(brand);

    if (!categoryId || !brandId)
      throw new Error(
        `Seed product "${product.name}" references an unknown ${
          !categoryId ? 'category' : 'brand'
        }.`,
      );

    return { ...product, category: categoryId, brand: brandId };
  });

  for (const productData of products) {
    const product = (await Product.findOne({ sku: productData.sku })) || new Product();
    Object.assign(product, productData);
    await product.save();
  }

  const [reviewers, seededProducts] = await Promise.all([
    ensureReviewUsers(),
    Product.find(
      { sku: { $in: productSeeds.map((product) => product.sku) } },
      { _id: 1, sku: 1 },
    ),
  ]);
  const productsBySku = new Map(seededProducts.map((product) => [product.sku, product]));

  for (const reviewData of reviewSeeds) {
    const product = productsBySku.get(reviewData.sku);
    const user = reviewers.get(reviewData.reviewerEmail);
    if (!product || !user)
      throw new Error(`Seed review references an unknown product or reviewer.`);

    const review =
      (await Review.findOne({ user: user._id, product: product._id })) || new Review();
    Object.assign(review, {
      user: user._id,
      product: product._id,
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      images: [],
      isVerifiedPurchase: false,
      status: 'approved',
    });
    await review.save();
  }

  await refreshRatings(seededProducts.map((product) => product._id));

  console.log(
    `Rigora catalog seed complete: ${categories.length} categories, ${brands.length} brands, ${products.length} products, ${reviewSeeds.length} reviews.`,
  );
}

seed()
  .catch((error) => {
    console.error('Catalog seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
