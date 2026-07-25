import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export function useCatalogResources() {
  const [resources, setResources] = useState({
    categories: [],
    brands: [],
    loading: true,
  });
  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/brands')])
      .then(([categories, brands]) =>
        setResources({
          categories: categories.data.items,
          brands: brands.data.items,
          loading: false,
        }),
      )
      .catch(() => setResources((value) => ({ ...value, loading: false })));
  }, []);
  return resources;
}

export function useProducts(filters) {
  const filterKey = JSON.stringify(filters);
  const [state, setState] = useState({
    products: [],
    pagination: null,
    loading: true,
    error: '',
  });
  useEffect(() => {
    setState((value) => ({ ...value, loading: true, error: '' }));
    api
      .get('/products', { params: JSON.parse(filterKey) })
      .then(({ data }) =>
        setState({
          products: data.products,
          pagination: data.pagination,
          loading: false,
          error: '',
        }),
      )
      .catch(() =>
        setState({
          products: [],
          pagination: null,
          loading: false,
          error: 'Unable to load products right now.',
        }),
      );
  }, [filterKey]);
  return state;
}
