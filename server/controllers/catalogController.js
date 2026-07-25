import Brand from '../models/Brand.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const populateProduct = (query) =>
  query.populate('category', 'name slug').populate('brand', 'name slug logo');
const bool = (value) => value === true || value === 'true';
const filesToUrls = (files = []) => files.map((file) => `/uploads/${file.filename}`);
function normalizeProduct(body, files) {
  const values = { ...body };
  ['price', 'compareAtPrice', 'stock'].forEach((field) => {
    if (values[field] !== undefined && values[field] !== '')
      values[field] = Number(values[field]);
  });
  ['featured', 'newArrival', 'bestSeller', 'isActive'].forEach((field) => {
    if (values[field] !== undefined) values[field] = bool(values[field]);
  });
  if (typeof values.specifications === 'string') {
    try {
      values.specifications = JSON.parse(values.specifications);
    } catch {
      delete values.specifications;
    }
  }
  delete values.images;
  if (files?.length) values.images = filesToUrls(files);
  return values;
}

export const listProducts = asyncHandler(async (request, response) => {
  const page = Math.max(Number.parseInt(request.query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(request.query.limit, 10) || 12, 1),
    100,
  );
  const filter = { isActive: true };
  if (request.query.category) filter.category = request.query.category;
  if (request.query.brand) filter.brand = request.query.brand;
  ['featured', 'newArrival', 'bestSeller'].forEach((field) => {
    if (request.query[field] !== undefined) filter[field] = bool(request.query[field]);
  });
  if (request.query.search?.trim()) {
    const escapedSearch = request.query.search
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchPattern = new RegExp(escapedSearch, 'i');
    const [matchingBrands, matchingCategories] = await Promise.all([
      Brand.find({ name: searchPattern }).distinct('_id'),
      Category.find({ name: searchPattern }).distinct('_id'),
    ]);
    filter.$or = [
      { name: searchPattern },
      { description: searchPattern },
      { sku: searchPattern },
      { brand: { $in: matchingBrands } },
      { category: { $in: matchingCategories } },
    ];
  }
  const sorts = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    name: { name: 1 },
  };
  const [products, total] = await Promise.all([
    populateProduct(
      Product.find(filter)
        .sort(sorts[request.query.sort] || sorts.newest)
        .skip((page - 1) * limit)
        .limit(limit),
    ),
    Product.countDocuments(filter),
  ]);
  response.status(200).json({
    products,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});
export const getProduct = asyncHandler(async (request, response) => {
  const product = await populateProduct(
    Product.findOne({ slug: request.params.slug, isActive: true }),
  );
  if (!product) return response.status(404).json({ message: 'Product not found.' });
  return response.status(200).json({ product });
});
export const createProduct = asyncHandler(async (request, response) => {
  const product = await Product.create(normalizeProduct(request.body, request.files));
  await product.populate('category', 'name slug');
  await product.populate('brand', 'name slug logo');
  response.status(201).json({ product });
});
export const updateProduct = asyncHandler(async (request, response) => {
  const product = await Product.findById(request.params.id);
  if (!product) return response.status(404).json({ message: 'Product not found.' });
  const values = normalizeProduct(request.body, request.files);
  if (request.body.existingImages)
    values.images = Array.isArray(request.body.existingImages)
      ? request.body.existingImages
      : JSON.parse(request.body.existingImages);
  if (request.files?.length)
    values.images = [...(values.images || product.images), ...filesToUrls(request.files)];
  Object.assign(product, values);
  await product.save();
  await product.populate('category', 'name slug');
  await product.populate('brand', 'name slug logo');
  return response.status(200).json({ product });
});
export const deleteProduct = asyncHandler(async (request, response) => {
  const product = await Product.findByIdAndDelete(request.params.id);
  if (!product) return response.status(404).json({ message: 'Product not found.' });
  return response.status(204).send();
});

function resourceController(Model) {
  return {
    list: asyncHandler(async (_request, response) =>
      response.status(200).json({ items: await Model.find().sort({ name: 1 }) }),
    ),
    get: asyncHandler(async (request, response) => {
      const item = await Model.findOne({ slug: request.params.slug });
      if (!item) return response.status(404).json({ message: 'Resource not found.' });
      return response.status(200).json({ item });
    }),
    create: asyncHandler(async (request, response) =>
      response.status(201).json({ item: await Model.create(request.body) }),
    ),
    update: asyncHandler(async (request, response) => {
      const item = await Model.findById(request.params.id);
      if (!item) return response.status(404).json({ message: 'Resource not found.' });
      Object.assign(item, request.body);
      await item.save();
      return response.status(200).json({ item });
    }),
    remove: asyncHandler(async (request, response) => {
      const item = await Model.findByIdAndDelete(request.params.id);
      if (!item) return response.status(404).json({ message: 'Resource not found.' });
      return response.status(204).send();
    }),
  };
}
export const categoryController = resourceController(Category);
export const brandController = resourceController(Brand);
