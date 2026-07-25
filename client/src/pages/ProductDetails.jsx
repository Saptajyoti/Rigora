import { Heart, ShoppingCart, ZoomIn } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ProductGrid from '../components/ProductGrid';
import SiteHeader from '../components/SiteHeader';
import { useProducts } from '../hooks/useCatalog';
import { imageUrl, money } from '../lib/catalog';
import { api } from '../lib/api';
import { addToCart, toggleWishlist } from '../store/storeSlice';
import { fetchProductReviews } from '../store/reviewSlice';
import { RatingSummary, ReviewForm, ReviewList } from '../components/Reviews';

export default function ProductDetails() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.store.wishlist?.products || []);
  const [state, setState] = useState({ product: null, error: '' });
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomed, setZoomed] = useState(false);
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
        <main className="mx-auto max-w-7xl px-5 py-16 text-zinc-400">
          Loading product…
        </main>
      </>
    );
  const { product } = state;
  const images = product.images || [];
  const isWishlisted = wishlist.some(
    (item) => item._id === product._id || item.product === product._id,
  );
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
        <Link className="text-sm text-cyan-300" to="/products">
          ← All products
        </Link>
        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5">
              {images[selectedImage] ? (
                <img
                  onClick={() => setZoomed(!zoomed)}
                  src={imageUrl(images[selectedImage])}
                  alt={product.name}
                  className={`aspect-square w-full cursor-zoom-in object-cover transition duration-300 ${zoomed ? 'scale-150' : ''}`}
                />
              ) : (
                <div className="grid aspect-square place-items-center text-zinc-600">
                  Rigora
                </div>
              )}
              <button
                onClick={() => setZoomed(!zoomed)}
                aria-label="Toggle image zoom"
                className="absolute bottom-4 right-4 rounded-full bg-black/60 p-3"
              >
                <ZoomIn size={18} />
              </button>
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-auto">
                {images.map((image, index) => (
                  <button
                    key={image}
                    onClick={() => {
                      setSelectedImage(index);
                      setZoomed(false);
                    }}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border ${selectedImage === index ? 'border-cyan-300' : 'border-white/10'}`}
                  >
                    <img
                      src={imageUrl(image)}
                      alt={`${product.name} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          <section>
            <p className="text-xs uppercase tracking-[.25em] text-cyan-300">
              {product.brand?.name}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">{product.name}</h1>
            <p className="mt-5 text-3xl font-semibold">{money(product.price)}</p>
            <div className="mt-3 flex items-center gap-2 text-sm text-amber-300">
              {Number(product.averageRating || 0).toFixed(1)} / 5{' '}
              <span className="text-zinc-400">({product.reviewCount || 0} reviews)</span>
            </div>
            {product.compareAtPrice > product.price && (
              <p className="mt-1 text-zinc-500 line-through">
                {money(product.compareAtPrice)}
              </p>
            )}
            <p className="mt-7 leading-7 text-zinc-300">{product.description}</p>
            <p className="mt-5 text-sm text-zinc-400">
              {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                disabled={product.stock < 1}
                onClick={() => dispatch(addToCart({ product }))}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-300 py-3 font-semibold text-zinc-950 disabled:opacity-50"
              >
                <ShoppingCart size={18} />{' '}
                {product.stock > 0 ? 'Add to cart' : 'Out of stock'}
              </button>
              <button
                onClick={() => dispatch(toggleWishlist(product._id))}
                aria-label="Toggle wishlist"
                className={`rounded-xl border px-4 ${isWishlisted ? 'border-rose-400 text-rose-300' : 'border-white/15'}`}
              >
                <Heart fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>
            <div className="mt-8 border-t border-white/10 pt-6">
              <h2 className="font-semibold">Specifications</h2>
              <dl className="mt-4 space-y-3">
                {Object.entries(product.specifications || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-5 text-sm">
                    <dt className="text-zinc-500">{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        </div>
        <section className="mt-16">
          <h2 className="text-2xl font-semibold">Related products</h2>
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
            <h2 className="text-2xl font-semibold">Recently viewed</h2>
            <div className="mt-6">
              <ProductGrid products={recentlyViewed} loading={false} />
            </div>
          </section>
        )}
        {(recommendations.alsoBought.length > 0 ||
          recommendations.alsoViewed.length > 0) && (
          <section className="mt-16">
            <h2 className="text-2xl font-semibold">Customers also explored</h2>
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
            <h2 className="text-2xl font-semibold">Reviews</h2>
            <ReviewList />
            <ReviewForm productId={product._id} />
          </div>
        </section>
      </main>
    </>
  );
}
