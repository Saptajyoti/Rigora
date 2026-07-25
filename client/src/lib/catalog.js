import { api } from './api';

export const imageUrl = (source) => {
  if (!source) return '';
  if (/^https?:\/\//.test(source)) return source;
  return `${api.defaults.baseURL.replace(/\/api$/, '')}${source}`;
};

export const money = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(
    value || 0,
  );
