import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const recommendations = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  const related = await Product.find({
    _id: { $ne: product.id },
    isActive: true,
    stock: { $gt: 0 },
    $or: [
      { category: product.category },
      { brand: product.brand },
      { price: { $gte: product.price * 0.75, $lte: product.price * 1.25 } },
    ],
  }).limit(8);
  const orders = await Order.find({
    orderStatus: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
    'items.product': product.id,
  }).select('items.product');
  const ids = orders
    .flatMap((order) => order.items.map((item) => item.product.toString()))
    .filter((id) => id !== product.id);
  const counts = ids.reduce((map, id) => ({ ...map, [id]: (map[id] || 0) + 1 }), {});
  const bought = await Product.find({
    _id: { $in: Object.keys(counts) },
    isActive: true,
    stock: { $gt: 0 },
  });
  bought.sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0));
  res
    .status(200)
    .json({ related, alsoViewed: related.slice(0, 4), alsoBought: bought.slice(0, 4) });
});
