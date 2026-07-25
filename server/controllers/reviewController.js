import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const populated = (query) =>
  query
    .populate('user', 'firstName lastName username avatar')
    .populate('product', 'name slug');
const images = (files = []) => files.map((file) => `/uploads/${file.filename}`);
export async function refreshRating(productId) {
  const stats = await Review.aggregate([
    { $match: { product: productId, status: 'approved' } },
    {
      $group: {
        _id: '$product',
        average: { $avg: '$rating' },
        count: { $sum: 1 },
        one: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        two: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        three: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        four: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        five: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
      },
    },
  ]);
  const value = stats[0] || {
    average: 0,
    count: 0,
    one: 0,
    two: 0,
    three: 0,
    four: 0,
    five: 0,
  };
  await Product.findByIdAndUpdate(productId, {
    averageRating: value.average,
    reviewCount: value.count,
    ratingDistribution: {
      one: value.one,
      two: value.two,
      three: value.three,
      four: value.four,
      five: value.five,
    },
  });
}
async function verifiedOrder(user, product) {
  return Order.findOne({ user, orderStatus: 'delivered', 'items.product': product });
}
export const createReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  const order = await verifiedOrder(req.user.id, product.id);
  const review = await Review.create({
    user: req.user.id,
    product: product.id,
    order: order?._id,
    rating: req.body.rating,
    title: req.body.title,
    comment: req.body.comment,
    images: images(req.files),
    isVerifiedPurchase: Boolean(order),
    status: order ? 'approved' : 'pending',
  });
  if (review.status === 'approved') await refreshRating(product.id);
  res.status(201).json({ review: await populated(Review.findById(review.id)) });
});
export const listProductReviews = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const filter = { product: req.params.productId, status: 'approved' };
  if (req.query.rating) filter.rating = Number(req.query.rating);
  if (req.query.verified === 'true') filter.isVerifiedPurchase = true;
  const sorts = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    helpful: { helpfulUsers: -1 },
    rating: { rating: -1 },
  };
  const [reviews, total] = await Promise.all([
    populated(
      Review.find(filter)
        .sort(sorts[req.query.sort] || sorts.newest)
        .skip((page - 1) * limit)
        .limit(limit),
    ),
    Review.countDocuments(filter),
  ]);
  res.status(200).json({
    reviews,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});
export const myReviews = asyncHandler(async (req, res) =>
  res.status(200).json({
    reviews: await populated(Review.find({ user: req.user.id }).sort({ createdAt: -1 })),
  }),
);
export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.reviewId, user: req.user.id });
  if (!review) return res.status(404).json({ message: 'Review not found.' });
  ['rating', 'title', 'comment'].forEach((field) => {
    if (req.body[field] !== undefined) review[field] = req.body[field];
  });
  if (req.files?.length)
    review.images = [...review.images, ...images(req.files)].slice(0, 4);
  if (review.status === 'approved') await refreshRating(review.product);
  await review.save();
  if (review.status === 'approved') await refreshRating(review.product);
  res.status(200).json({ review: await populated(Review.findById(review.id)) });
});
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOneAndDelete({
    _id: req.params.reviewId,
    user: req.user.id,
  });
  if (!review) return res.status(404).json({ message: 'Review not found.' });
  await refreshRating(review.product);
  res.status(204).send();
});
export const toggleHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review || review.status !== 'approved')
    return res.status(404).json({ message: 'Review not found.' });
  if (review.user.equals(req.user.id))
    return res.status(400).json({ message: 'You cannot vote on your own review.' });
  const exists = review.helpfulUsers.some((id) => id.equals(req.user.id));
  if (exists) review.helpfulUsers.pull(req.user.id);
  else review.helpfulUsers.push(req.user.id);
  await review.save();
  res.status(200).json({ review, helpful: !exists });
});
export const adminReviews = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.rating) filter.rating = Number(req.query.rating);
  if (req.query.verified === 'true') filter.isVerifiedPurchase = true;
  if (req.query.product) filter.product = req.query.product;
  res.status(200).json({
    reviews: await populated(Review.find(filter).sort({ createdAt: -1 }).limit(200)),
  });
});
export const moderateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) return res.status(404).json({ message: 'Review not found.' });
  review.status = req.body.status;
  await review.save();
  await refreshRating(review.product);
  res.status(200).json({ review });
});
export const adminDeleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.reviewId);
  if (!review) return res.status(404).json({ message: 'Review not found.' });
  await refreshRating(review.product);
  res.status(204).send();
});
