import { ShoppingCart } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ProductGrid from '../components/ProductGrid';
import SiteHeader from '../components/SiteHeader';
import { useProducts } from '../hooks/useCatalog';
import { money } from '../lib/catalog';
import { api } from '../lib/api';
import { addToCart, toggleWishlist } from '../store/storeSlice';
import { fetchProductReviews } from '../store/reviewSlice';
import { RatingSummary, ReviewForm, ReviewList } from '../components/Reviews';
import AnimatedAddToCartButton from '../components/AnimatedAddToCartButton';
import AnimatedWishlistButton from '../components/AnimatedWishlistButton';
import ProductGallery from '../components/ProductGallery';
import QuantitySelector from '../components/QuantitySelector';
import { getMotionVariants, viewportOptions } from '../motion/variants';

function DetailSectionHeading({ eyebrow, title }) {
  return (
    <div className="border-b border-white/10 pb-4">
      <p className="rigora-kicker">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
    </div>
  );
}

function ProductDetailsSkeleton() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-10" aria-label="Loading product">
      <div className="rigora-product-skeleton h-4 w-28 rounded" />
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="rigora-panel overflow-hidden">
          <div className="rigora-product-skeleton aspect-square" />
          <div className="mt-3 flex gap-3">
            <div className="rigora-product-skeleton h-20 w-20 rounded-lg" />
            <div className="rigora-product-skeleton h-20 w-20 rounded-lg" />
          </div>
        </div>
        <div className="space-y-5">
          <div className="rigora-product-skeleton h-3 w-28 rounded" />
          <div className="rigora-product-skeleton h-11 w-5/6 rounded" />
          <div className="rigora-product-skeleton h-5 w-36 rounded" />
          <div className="rigora-product-skeleton h-8 w-44 rounded" />
          <div className="rigora-product-skeleton h-24 w-full rounded-xl" />
          <div className="flex gap-3">
            <div className="rigora-product-skeleton h-11 w-28 rounded-lg" />
            <div className="rigora-product-skeleton h-11 flex-1 rounded-lg" />
            <div className="rigora-product-skeleton h-11 w-11 rounded-lg" />
          </div>
          <div className="rigora-panel space-y-3 p-5">
            <div className="rigora-product-skeleton h-5 w-32 rounded" />
            <div className="rigora-product-skeleton h-3 w-full rounded" />
            <div className="rigora-product-skeleton h-3 w-4/5 rounded" />
            <div className="rigora-product-skeleton h-3 w-11/12 rounded" />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ProductDetails() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.store.wishlist?.products || []);
  const [state, setState] = useState({ product: null, error: '' });
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const reduceMotion = useReducedMotion();
  const variants = getMotionVariants(reduceMotion);
  const [recommendations, setRecommendations] = useState({
    alsoBought: [],
    alsoViewed: [],
  });
  const related = useProducts({
    category:
      state.product?.category?._id ||
      state.product?.category ||
      '000000000000000000000000',
    limit: 5,
    page: 1,
    sort: 'newest',
  });
  useEffect(() => {
    api
      .get(`/products/${slug}`)
      .then(({ data }) => setState({ product: data.product, error: '' }))
      .catch((error) =>
        setState({
          product: null,
          error: error.response?.data?.message || 'Unable to load product.',
        }),
      );
  }, [slug]);
  useEffect(() => {
    if (state.product?._id)
      dispatch(
        fetchProductReviews({ productId: state.product._id, params: { sort: 'newest' } }),
      );
  }, [dispatch, state.product?._id]);
  useEffect(() => {
    if (!state.product?._id) return;
    api
      .get(`/products/${state.product._id}/recommendations`)
      .then(({ data }) => setRecommendations(data))
      .catch(() => setRecommendations({ alsoBought: [], alsoViewed: [] }));
  }, [state.product?._id]);
  useEffect(() => {
    setSelectedImage(0);
    setZoomed(false);
    setQuantity(1);
  }, [slug]);
  useEffect(() => {
    if (!state.product) return;
    try {
      const viewed = JSON.parse(
        localStorage.getItem('rigora_recently_viewed') || '[]',
      ).filter((item) => item._id !== state.product._id);
      localStorage.setItem(
        'rigora_recently_viewed',
        JSON.stringify([state.product, ...viewed].slice(0, 8)),
      );
    } catch {
      /* storage is optional */
    }
  }, [state.product]);
  if (state.error)
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-7xl px-5 py-16">
          <p className="text-rose-300">{state.error}</p>
        </main>
      </>
    );
  if (!state.product)
    return (
      <>
        <SiteHeader />
        <ProductDetailsSkeleton />
      </>
    );
  const { product } = state;
  const images = product.images || [];
  const isWishlisted = wishlist.some(
    (item) => item._id === product._id || item.product === product._id,
  );
  const handleAddToCart = () => dispatch(addToCart({ product, quantity })).unwrap();
  let recentlyViewed = [];
  try {
    recentlyViewed = JSON.parse(localStorage.getItem('rigora_recently_viewed') || '[]')
      .filter((item) => item._id !== product._id)
      .slice(0, 4);
  } catch {
    recentlyViewed = [];
  }
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-10">
        <motion.div initial="hidden" animate="visible" variants={variants.fadeUp}>
          <Link className="text-sm text-cyan-300" to="/products">
            ← All products
          </Link>
        </motion.div>
        <motion.div
          className="mt-6 grid gap-10 lg:grid-cols-2"
          variants={variants.staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={variants.scaleIn}>
            <ProductGallery
              product={product}
              images={images}
              selectedImage={selectedImage}
              onSelectImage={(index) => {
                setSelectedImage(index);
                setZoomed(false);
              }}
              previewOpen={zoomed}
              onPreviewChange={setZoomed}
            />
          </motion.div>
          <motion.section
            variants={variants.staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.p className="rigora-kicker" variants={variants.staggerItem}>
              {product.brand?.name || 'Rigora'}
              {product.category?.name ? ` / ${product.category.name}` : ''}
            </motion.p>
            <motion.h1
              className="mt-3 text-4xl font-semibold tracking-tight"
              variants={variants.staggerItem}
            >
              {product.name}
            </motion.h1>
            <motion.div
              className="mt-3 flex items-center gap-2 text-sm text-amber-300"
              variants={variants.staggerItem}
            >
              {Number(product.averageRating || 0).toFixed(1)} / 5{' '}
              <span className="text-zinc-400">({product.reviewCount || 0} reviews)</span>
            </motion.div>
            <motion.div variants={variants.staggerItem}>
              <p className="mt-5 text-3xl font-semibold">{money(product.price)}</p>
              {product.compareAtPrice > product.price && (
                <p className="mt-1 text-zinc-500 line-through">
                  {money(product.compareAtPrice)}
                </p>
              )}
            </motion.div>
            <motion.p
              className="mt-7 leading-7 text-zinc-300"
              variants={variants.staggerItem}
            >
              {product.description}
            </motion.p>
            <motion.div
              className="rigora-panel mt-6 grid grid-cols-2 divide-x divide-white/10 overflow-hidden text-sm"
              variants={variants.staggerItem}
            >
              <div className="p-4">
                <p className="rigora-kicker">Availability</p>
                <p
                  className={`mt-2 font-semibold ${product.stock > 0 ? 'text-emerald-300' : 'text-rose-300'}`}
                >
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </p>
              </div>
              <div className="p-4">
                <p className="rigora-kicker">Catalog code</p>
                <p className="mt-2 truncate font-mono text-xs text-zinc-300">
                  {product.sku || 'Not assigned'}
                </p>
              </div>
            </motion.div>
            <motion.div
              className="mt-6 flex flex-wrap gap-3"
              variants={variants.staggerItem}
            >
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                max={Math.max(1, product.stock)}
              />
              <AnimatedAddToCartButton
                disabled={product.stock < 1}
                onAdd={handleAddToCart}
                icon={<ShoppingCart size={18} aria-hidden="true" />}
                className="rigora-primary-action flex flex-1 items-center justify-center gap-2 py-3 disabled:opacity-50"
              />
              <AnimatedWishlistButton
                onToggle={() => dispatch(toggleWishlist(product._id)).unwrap()}
                isWishlisted={isWishlisted}
                label={`Toggle ${product.name} in wishlist`}
                className={`rigora-control border px-4 ${isWishlisted ? 'border-rose-400 text-rose-300' : 'border-white/15'}`}
              />
            </motion.div>
            <motion.div
              className="rigora-panel mt-8 overflow-hidden"
              variants={variants.staggerItem}
            >
              <div className="border-b border-white/10 px-5 py-4">
                <p className="rigora-kicker">Technical reference</p>
                <h2 className="mt-1 font-semibold">Specifications</h2>
              </div>
              <motion.dl
                className="divide-y divide-white/10"
                variants={variants.staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOptions}
              >
                {Object.entries(product.specifications || {}).map(([key, value]) => (
                  <motion.div
                    key={key}
                    className="flex justify-between gap-5 px-5 py-3 text-sm"
                    variants={variants.staggerItem}
                  >
                    <dt className="text-zinc-500">{key}</dt>
                    <dd className="text-right">{value}</dd>
                  </motion.div>
                ))}
              </motion.dl>
            </motion.div>
          </motion.section>
        </motion.div>
        <section className="mt-16">
          <DetailSectionHeading
            eyebrow="Recommended for this build"
            title="Related products"
          />
          <div className="mt-6">
            <ProductGrid
              products={related.products
                .filter((item) => item._id !== product._id)
                .slice(0, 4)}
              loading={related.loading}
            />
          </div>
        </section>
        {recentlyViewed.length > 0 && (
          <section className="mt-16">
            <DetailSectionHeading eyebrow="Browsing history" title="Recently viewed" />
            <div className="mt-6">
              <ProductGrid products={recentlyViewed} loading={false} />
            </div>
          </section>
        )}
        {(recommendations.alsoBought.length > 0 ||
          recommendations.alsoViewed.length > 0) && (
          <section className="mt-16">
            <DetailSectionHeading
              eyebrow="Catalog patterns"
              title="Customers also explored"
            />
            <div className="mt-6">
              <ProductGrid
                products={(recommendations.alsoBought.length
                  ? recommendations.alsoBought
                  : recommendations.alsoViewed
                ).filter((item) => item._id !== product._id)}
                loading={false}
              />
            </div>
          </section>
        )}
        <section className="mt-16 grid gap-8 lg:grid-cols-[320px_1fr]">
          <RatingSummary product={product} />
          <div>
            <DetailSectionHeading eyebrow="Verified feedback" title="Reviews" />
            <ReviewList />
            <ReviewForm productId={product._id} />
          </div>
        </section>
      </main>
    </>
  );
}
