import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import Brand from '../models/Brand.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import brands from './brands.js';
import categories from './categories.js';
import productSeeds from './products.js';

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

  console.log(
    `Rigora catalog seed complete: ${categories.length} categories, ${brands.length} brands, ${products.length} products.`,
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
