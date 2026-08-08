import { api } from './api';

export const productPlaceholder = '/products/placeholder.png';

export const imageUrl = (source) => {
  if (!source) return '';
  if (/^https?:\/\//.test(source)) return source;
  if (source.startsWith('/products/')) return source;
  return `${api.defaults.baseURL.replace(/\/api$/, '')}${source}`;
};

export const useImageFallback = (event, fallback = productPlaceholder) => {
  const image = event.currentTarget;

  if (image.dataset.fallbackApplied) return;

  image.dataset.fallbackApplied = 'true';
  image.src = imageUrl(fallback);
};

export const money = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(
    value || 0,
  );
