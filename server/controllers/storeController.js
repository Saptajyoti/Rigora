import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const populate = (query) =>
  query.populate({
    path: 'items.product',
    select: 'name slug price compareAtPrice stock images brand isActive',
  });

function cartResponse(cart) {
  const items = cart.items.filter((item) => item.product);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return {
    cart: {
      ...cart.toObject(),
      items,
    },
    totals: {
      subtotal,
      estimatedTotal: subtotal,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    },
  };
}

async function getUserCart(user) {
  return populate(
    await Cart.findOneAndUpdate(
      { user },
      {},
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    ),
  );
}

export const getCart = asyncHandler(async (req, res) => {
  const cart = await getUserCart(req.user.id);
  return res.status(200).json(cartResponse(cart));
});

export const addCartItem = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.body.productId,
    isActive: true,
  });

  if (!product) {
    return res.status(404).json({
      message: 'Product not found.',
    });
  }

  if (product.stock < 1) {
    return res.status(400).json({ message: 'This product is out of stock.' });
  }

  const cart = await Cart.findOneAndUpdate(
    { user: req.user.id },
    {},
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  const item = cart.items.find((entry) => entry.product.equals(product.id));

  if (item) {
    item.quantity = Math.min(item.quantity + (req.body.quantity || 1), product.stock);
  } else {
    cart.items.push({
      product: product.id,
      quantity: Math.min(req.body.quantity || 1, product.stock),
    });
  }

  await cart.save();

  return res.status(200).json(cartResponse(await populate(Cart.findById(cart.id))));
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await populate(Cart.findOne({ user: req.user.id }));

  const item = cart?.items.id(req.params.itemId);

  if (!item) {
    return res.status(404).json({
      message: 'Cart item not found.',
    });
  }

  if (!item.product || !item.product.isActive) {
    return res.status(400).json({ message: 'This product is no longer available.' });
  }

  if (req.body.quantity > item.product.stock) {
    return res.status(400).json({
      message: `Only ${item.product.stock} units are available.`,
    });
  }

  item.quantity = req.body.quantity;

  await cart.save();

  return res.status(200).json(cartResponse(await populate(Cart.findById(cart.id))));
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({
    user: req.user.id,
  });

  if (!cart) {
    return res.status(404).json({
      message: 'Cart item not found.',
    });
  }

  cart.items.pull(req.params.itemId);

  await cart.save();

  return res.status(200).json(cartResponse(await populate(Cart.findById(cart.id))));
});

export const mergeGuestCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user.id },
    {},
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  for (const entry of req.body.items || []) {
    const product = await Product.findOne({
      _id: entry.productId,
      isActive: true,
    });

    if (!product) continue;

    const item = cart.items.find((current) => current.product.equals(product.id));

    if (item) {
      item.quantity = Math.min(item.quantity + entry.quantity, product.stock);
    } else {
      cart.items.push({
        product: product.id,
        quantity: Math.min(entry.quantity, product.stock),
      });
    }
  }

  await cart.save();

  return res.status(200).json(cartResponse(await populate(Cart.findById(cart.id))));
});

export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOneAndUpdate(
    { user: req.user.id },
    {},
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  ).populate('products', 'name slug price compareAtPrice images brand');

  res.status(200).json({
    wishlist,
  });
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.body.productId,
    isActive: true,
  });

  if (!product) {
    return res.status(404).json({
      message: 'Product not found.',
    });
  }

  const wishlist = await Wishlist.findOneAndUpdate(
    { user: req.user.id },
    {},
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  const exists = wishlist.products.some((id) => id.equals(product.id));

  if (exists) {
    wishlist.products.pull(product.id);
  } else {
    wishlist.products.push(product.id);
  }

  await wishlist.save();

  await wishlist.populate('products', 'name slug price compareAtPrice images brand');

  return res.status(200).json({
    wishlist,
    saved: !exists,
  });
});
