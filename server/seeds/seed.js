import 'dotenv/config';
import mongoose from 'mongoose';
import Brand from '../models/Brand.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import brands from './brands.js';
import categories from './categories.js';
import productSeeds from './products.js';

async function seed() {
  if (!process.env.MONGODB_URI)
    throw new Error('MONGODB_URI must be set in server/.env.');
  await mongoose.connect(process.env.MONGODB_URI);
  const clear = process.argv.includes('--clear');
  if (clear)
    await Promise.all([
      Product.deleteMany({}),
      Category.deleteMany({}),
      Brand.deleteMany({}),
    ]);
  for (const categoryData of categories) {
    const category =
      (await Category.findOne({ name: categoryData.name })) || new Category();
    Object.assign(category, categoryData);
    await category.save();
  }
  for (const brandData of brands) {
    const brand = (await Brand.findOne({ name: brandData.name })) || new Brand();
    Object.assign(brand, brandData);
    await brand.save();
  }
  const [categoryDocuments, brandDocuments] = await Promise.all([
    Category.find(),
    Brand.find(),
  ]);
  const categoryIds = new Map(
    categoryDocuments.map((category) => [category.name, category._id]),
  );
  const brandIds = new Map(brandDocuments.map((brand) => [brand.name, brand._id]));
  const products = productSeeds.map(({ category, brand, ...product }) => ({
    ...product,
    category: categoryIds.get(category),
    brand: brandIds.get(brand),
    sku: `RIG-${product.name
      .replace(/[^A-Z0-9]/gi, '')
      .slice(0, 18)
      .toUpperCase()}`,
  }));
  if (products.some((product) => !product.category || !product.brand))
    throw new Error('Seed data references an unknown category or brand.');
  for (const productData of products) {
    const product = (await Product.findOne({ sku: productData.sku })) || new Product();
    Object.assign(product, productData);
    await product.save();
  }
  console.log(
    `Rigora catalog seeded: ${categoryDocuments.length} categories, ${brandDocuments.length} brands, ${products.length} products.`,
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
